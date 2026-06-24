import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchAiSuggestions, fetchFormDefinition } from '../data/mockFormApi';
import { getFormAttributes, getFormAttributeValues, saveFormAttributeValuesBulk, updateFormAttributeValuesBulk, getCompanyThreshold, getIrlFormById, getSecurityHoldersEquityShares, getAuditorsDetails, getCompanyAddresses } from '../services/api';

export function useFormEngine(formId, formTypeId = 2) {
  const [sections, setSections] = useState([]);
  const [values, setValues] = useState({});
  const [aiFilledFields, setAiFilledFields] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [percentComplete, setPercentComplete] = useState(0);

  // Helper to extract all fields from the schema to calculate completion and default values
  const extractAllFields = useCallback((sectionsList) => {
    let allFields = [];
    const traverseFields = (fields) => {
      if (fields) {
        allFields = [...allFields, ...fields];
      }
    };
    
    const traverseTables = (tables) => {
      if (!tables) return;
      tables.forEach(table => {
        if (table.rows) {
          table.rows.forEach(row => {
            if (row.cells) {
              // Create mock field objects for table cells to reuse logic
              row.cells.forEach(cell => {
                if (cell.attributeId) {
                  allFields.push({
                    attributeId: cell.attributeId,
                    required: row.required,
                    defaultValue: cell.value,
                    value: cell.value
                  });
                }
              });
            }
          });
        }
      });
    };

    const traverseDynamicGroups = (groups) => {
      if (!groups) return;
      groups.forEach(group => {
        if (group.fields) traverseFields(group.fields);
        if (group.columns) traverseFields(group.columns);
      });
    };

    sectionsList.forEach(section => {
      traverseFields(section.fields);
      traverseTables(section.tables);
      traverseDynamicGroups(section.dynamicGroups);
      traverseFields(section.additionalFields);

      if (section.subsections) {
        section.subsections.forEach(sub => {
          traverseFields(sub.fields);
          traverseTables(sub.tables);
          traverseDynamicGroups(sub.dynamicGroups);
          traverseFields(sub.additionalFields);
        });
      }
    });

    return allFields;
  }, []);

  // Initialize form
  useEffect(() => {
    let isMounted = true;
    
    const initForm = async () => {
      try {
        setLoading(true);
        
        // Fetch schema and values in parallel, fallback to mock if API fails
        const [attrDef, attrVals] = await Promise.all([
          getFormAttributes(formTypeId).catch(err => {
            console.warn("API failed, falling back to mock definition", err);
            return fetchFormDefinition(formId); // fallback
          }),
          getFormAttributeValues(null, null, null, formId).catch(err => {
             console.warn("API failed to get values, using empty object", err);
             return { body: {} };
          })
        ]);
        
        if (!isMounted) return;

        // Use attrVals.body.sections as it contains the true schema and values from the API
        // Fallback to attrDef if attrVals is empty or missing sections
        let formSections = [];
        if (attrVals.body && attrVals.body.sections && attrVals.body.sections.length > 0) {
            formSections = attrVals.body.sections;
        } else if (attrDef.body && Array.isArray(attrDef.body)) {
            // Convert flat attributes array from backend to a single section
            formSections = [{
                sectionId: "default_section",
                sectionTitle: "Form Details",
                fields: attrDef.body.map(attr => ({
                    attributeId: attr.id,
                    fieldId: attr.fieldNo || `field_${attr.id}`,
                    label: attr.name,
                    type: attr.fieldType || "text",
                    ruleType: attr.ruleType,
                    ruleConfigJson: attr.ruleConfigJson,
                    options: attr.optionsJson ? JSON.parse(attr.optionsJson) : null,
                    defaultValue: attr.defaultValue,
                    placeholder: attr.placeholder,
                    isMandatory: attr.isMandatory,
                    isEditable: attr.isEditable !== false
                }))
            }];
        } else if (attrDef.body?.sections) {
            formSections = attrDef.body.sections;
        }
            
        const THEMES = ['blue', 'indigo', 'purple', 'emerald', 'orange', 'teal', 'rose', 'pink'];
        
        if (formSections && formSections.length > 0) {
            formSections = formSections.map((sec, i) => {
                if (!sec.theme || sec.theme === 'neutral') {
                    return { ...sec, theme: THEMES[i % THEMES.length] };
                }
                return sec;
            });
        }
            
        setSections(formSections);
        setPercentComplete(attrVals.body?.percentComplete || 0);

        // Pre-populate default values
        const allFields = extractAllFields(formSections);
        const initialValues = {};
        allFields.forEach(field => {
          if (field.defaultValue !== null && field.defaultValue !== undefined) {
            initialValues[field.attributeId] = field.defaultValue;
          }
        });
        
        // Merge fetched values from API
        const fetchedValues = {};
        
        // Helper to extract flat values
        const applyFlatValues = (arr) => {
           arr.forEach(item => {
             const val = item.attributeValue ?? item.savedValue ?? item.value;
             if (val !== undefined && val !== null) {
               fetchedValues[item.attributeId] = val;
             }
           });
        };

        if (attrVals.body?.sections) {
          const valFields = extractAllFields(attrVals.body.sections);
          valFields.forEach(field => {
            const val = field.attributeValue ?? field.savedValue ?? field.value;
            if (val !== undefined && val !== null) {
              fetchedValues[field.attributeId] = val;
            }
          });

          // Extract dynamic groups properly since extractAllFields skips them
          const processDynamicGroups = (groups) => {
            if (!groups) return;
            groups.forEach(group => {
              if (!fetchedValues[group.groupId]) {
                fetchedValues[group.groupId] = [];
              }
              
              // Case 1: Backend sends entities array
              if (group.entities && Array.isArray(group.entities) && group.entities.length > 0) {
                group.entities.forEach(entity => {
                   const entityValues = {};
                   const items = entity.fields || entity.cells || [];
                   items.forEach(f => {
                     const val = f.attributeValue ?? f.savedValue ?? f.value;
                     if (val !== undefined && val !== null) {
                       entityValues[f.attributeId] = val;
                     }
                   });
                   if (Object.keys(entityValues).length > 0) {
                     fetchedValues[group.groupId].push(entityValues);
                   }
                });
              }
              // Case 2: Backend sends rows array (like tables)
              else if (group.rows && Array.isArray(group.rows) && group.rows.length > 0) {
                group.rows.forEach(row => {
                   const entityValues = {};
                   const items = row.cells || row.fields || [];
                   items.forEach(f => {
                     const val = f.attributeValue ?? f.savedValue ?? f.value;
                     if (val !== undefined && val !== null) {
                       entityValues[f.attributeId] = val;
                     }
                   });
                   if (Object.keys(entityValues).length > 0) {
                     fetchedValues[group.groupId].push(entityValues);
                   }
                });
              }
              // Case 3: Backend sends flattened fields array with repeated attributes
              else if (group.fields && group.fields.length > 0) {
                const entitiesMap = {}; 
                const attrCounts = {}; 
                let hasValues = false;
                
                group.fields.forEach(f => {
                    const val = f.attributeValue ?? f.savedValue ?? f.value;
                    if (val !== undefined && val !== null) {
                      const attrId = f.attributeId;
                      if (attrCounts[attrId] === undefined) attrCounts[attrId] = 0;
                      
                      const idx = attrCounts[attrId];
                      if (!entitiesMap[idx]) entitiesMap[idx] = {};
                      
                      entitiesMap[idx][attrId] = val;
                      attrCounts[attrId]++;
                      hasValues = true;
                    }
                 });
                
                if (hasValues) {
                  const constructedEntities = Object.keys(entitiesMap).sort((a,b) => parseInt(a)-parseInt(b)).map(k => entitiesMap[k]);
                  if (constructedEntities.length > 0) {
                     constructedEntities.forEach(e => fetchedValues[group.groupId].push(e));
                  }
                }
              }
            });
          };

          const traverseSectionsForGroups = (sectionsList) => {
            if (!sectionsList) return;
            sectionsList.forEach(section => {
              processDynamicGroups(section.dynamicGroups);
              if (section.subsections) {
                section.subsections.forEach(sub => {
                  processDynamicGroups(sub.dynamicGroups);
                });
              }
            });
          };
          
          traverseSectionsForGroups(attrVals.body.sections);
          
          // Clean up empty dynamic groups so UI falls back to [{}]
          Object.keys(fetchedValues).forEach(key => {
            if (Array.isArray(fetchedValues[key]) && fetchedValues[key].length === 0) {
               delete fetchedValues[key];
            }
          });
        } else {
           // It might be a flat array returned directly or inside body/data
           const rawData = Array.isArray(attrVals) ? attrVals : (Array.isArray(attrVals.body) ? attrVals.body : (Array.isArray(attrVals.data) ? attrVals.data : null));
           if (rawData) {
             applyFlatValues(rawData);
           } else if (attrVals.body && typeof attrVals.body === 'object' && !attrVals.body.sections) {
             // Maybe it's a map?
             Object.keys(attrVals.body).forEach(key => {
               if (!isNaN(key)) {
                 fetchedValues[key] = attrVals.body[key];
               }
             });
           }
        }
        
        const mergedValues = { ...initialValues, ...fetchedValues };
        
        // --- Fetch Threshold Master and Pre-fill Paid up Share Capital ---
        let dynamicCompanyId = 6; // Fallback
        try {
          // Fetch IRL form details to get the dynamic companyId
          try {
             const irlForm = await getIrlFormById(formId);
             const compId = irlForm?.body?.companyId || irlForm?.data?.companyId || irlForm?.companyId;
             if (compId) dynamicCompanyId = compId;
          } catch (e) {
             console.warn("Could not fetch IRL form details for companyId, using fallback 6");
          }

          const thresholdData = await getCompanyThreshold(dynamicCompanyId);
          
          // API returns response wrapped in body or directly
          const tBody = thresholdData.body || thresholdData.data || thresholdData;
          const balanceSheetData = tBody?.balanceSheetRelatedData;
          const totalPaidUp = balanceSheetData?.totalPaidUpSharecapital 
                           ?? balanceSheetData?.totalPaidUpShareCapital 
                           ?? tBody?.totalPaidUpShareCapital 
                           ?? tBody?.total_paid_up_share_capital;
          
          if (totalPaidUp !== undefined && totalPaidUp !== null) {
             const allFields = extractAllFields(formSections);
             const paidUpField = allFields.find(f => f.label && f.label.toLowerCase().includes("paid up share capital"));
             
             if (paidUpField) {
                 // Overwrite or set the value
                 mergedValues[paidUpField.attributeId] = String(totalPaidUp);
                 console.log(`Pre-filled field '${paidUpField.label}' with value:`, totalPaidUp);
             }
          }
        } catch (err) {
          console.warn("Could not fetch threshold master for pre-filling", err);
        }
        // -----------------------------------------------------------------

        // --- Fetch Security Holders and Pre-fill Name of Holding Company ---
        try {
           console.log("Attempting to fetch security holders for company ID:", dynamicCompanyId);
           const securityData = await getSecurityHoldersEquityShares(dynamicCompanyId);
           console.log("Successfully fetched security holders:", securityData);
           const sBody = securityData.body || securityData.data || securityData;
           
           if (Array.isArray(sBody) && sBody.length > 0) {
              // Priority 1: Check if any record has nameOfUltimateHoldingCompany
              let holdingCompanyName = null;
              const ultimateHolder = sBody.find(s => s.nameOfUltimateHoldingCompany);
              if (ultimateHolder) {
                  holdingCompanyName = ultimateHolder.nameOfUltimateHoldingCompany;
              } else {
                  // Priority 2: Find a shareholder with > 50% shares
                  const majorHolder = sBody.find(s => s.percentageOfTotalEquitySharesHeld > 50);
                  if (majorHolder) {
                      holdingCompanyName = majorHolder.nameOfShareholder;
                  }
              }

              if (holdingCompanyName) {
                 const allFields = extractAllFields(formSections);
                 const holdingCompanyField = allFields.find(f => f.label && f.label.toLowerCase().includes("name of the holding company"));
                 
                 if (holdingCompanyField) {
                     mergedValues[holdingCompanyField.attributeId] = String(holdingCompanyName);
                     console.log(`Pre-filled field '${holdingCompanyField.label}' with value:`, holdingCompanyName);
                 }
              }

              // --- Pre-fill 'Paid up capital held by foreign company' ---
              let foreignHoldingSum = 0;
              sBody.forEach(holder => {
                  const type = String(holder.typeOfShareholder || "").toUpperCase().trim();
                  const countryStr = String(holder.country || "").toUpperCase().trim();
                  
                  const isForeignBody = type === 'FOREIGN BODY CORPORATE' || type === 'FOREIGN LLP' || type === 'FOREGIN LLP';
                  const isNotIndia = countryStr !== 'INDIA' && countryStr !== '101'; // 101 is usually India ID
                  
                  if (isForeignBody && isNotIndia) {
                      const perc = parseFloat(holder.percentageOfTotalEquitySharesHeld) || 0;
                      foreignHoldingSum += perc;
                  }
              });

              const allFields = extractAllFields(formSections);
              const foreignHoldingField = allFields.find(f => f.label && f.label.toLowerCase().includes("paid up capital held by foreign"));
              
              if (foreignHoldingField) {
                  mergedValues[foreignHoldingField.attributeId] = String(foreignHoldingSum);
                  console.log(`Pre-filled field '${foreignHoldingField.label}' with value:`, foreignHoldingSum);
              }
           }
        } catch (err) {
           console.warn("Could not fetch security holders for pre-filling", err);
        }
        // --- Fetch Auditors Details ---
        try {
           console.log("Attempting to fetch auditors details for company ID:", dynamicCompanyId);
           const auditorsData = await getAuditorsDetails(dynamicCompanyId);
           const aBody = auditorsData.body || auditorsData.data || auditorsData;
           
           if (aBody && aBody.statutoryAuditorsList && Array.isArray(aBody.statutoryAuditorsList)) {
               const allFields = extractAllFields(formSections);
               const auditorList = aBody.statutoryAuditorsList;
               
               // Number of Auditors
               const numAuditorsField = allFields.find(f => f.label && f.label.toLowerCase().includes("number of auditors"));
               if (numAuditorsField) {
                   mergedValues[numAuditorsField.attributeId] = String(auditorList.length);
                   console.log(`Pre-filled '${numAuditorsField.label}' with:`, auditorList.length);
               }

               if (auditorList.length > 0) {
                   const auditor = auditorList[0]; // Take the first auditor

                   // Name of partner / proprietor signing financials
                   if (auditor.nameOfIndividual) {
                       const partnerNameField = allFields.find(f => f.label && f.label.toLowerCase().includes("partner / proprietor signing financials"));
                       if (partnerNameField) {
                           mergedValues[partnerNameField.attributeId] = String(auditor.nameOfIndividual);
                           console.log(`Pre-filled '${partnerNameField.label}' with:`, auditor.nameOfIndividual);
                       }
                   }
               }
           }
        } catch (err) {
           console.warn("Could not fetch auditors details for pre-filling", err);
        }
        // -----------------------------------------------------------------

        // --- Fetch Company Addresses ---
        try {
           console.log("Attempting to fetch company addresses for company ID:", dynamicCompanyId);
           const addressData = await getCompanyAddresses(dynamicCompanyId);
           const addrBody = addressData.body || addressData.data || addressData;

           if (Array.isArray(addrBody) && addrBody.length > 0) {
               const address = addrBody[0]; // Pick the first address
               const allFields = extractAllFields(formSections);

               const addressMappings = [
                   { labelTerm: "address line 1", value: address.addressLine1 },
                   { labelTerm: "address line 2", value: address.addressLine2 },
                   { labelTerm: "country", value: address.country },
                   { labelTerm: "state", value: address.state },
                   { labelTerm: "city", value: address.city },
                   { labelTerm: "pin/zip code", value: address.zip },
                   { labelTerm: "zip code", value: address.zip }
               ];

               addressMappings.forEach(mapping => {
                   if (mapping.value !== undefined && mapping.value !== null) {
                       const field = allFields.find(f => f.label && f.label.toLowerCase() === mapping.labelTerm);
                       // Fallback to word boundary match if exact match not found
                       const fieldIncludes = allFields.find(f => {
                           if (!f.label) return false;
                           const regex = new RegExp(`\\b${mapping.labelTerm}\\b`, 'i');
                           return regex.test(f.label);
                       });
                       const targetField = field || fieldIncludes;
                       
                       if (targetField) {
                           mergedValues[targetField.attributeId] = String(mapping.value);
                           console.log(`Pre-filled '${targetField.label}' with:`, mapping.value);
                       }
                   }
               });
           }
        } catch (err) {
           console.warn("Could not fetch company addresses for pre-filling", err);
        }
        // -----------------------------------------------------------------

        setValues(mergedValues);
      } catch (error) {
        console.error("Error initializing form:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initForm();
    
    return () => {
      isMounted = false;
    };
  }, [formId, extractAllFields]);

  // Update a single value
  const updateValue = useCallback((attributeId, newValue) => {
    setValues(prev => ({
      ...prev,
      [attributeId]: newValue
    }));

    // If user manually edits an AI-filled field, remove the AI badge
    setAiFilledFields(prev => {
      if (prev.has(attributeId)) {
        const next = new Set(prev);
        next.delete(attributeId);
        return next;
      }
      return prev;
    });
  }, []);

  // Apply AI suggestions
  const applyAiSuggestions = useCallback(async () => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Dynamically generate dummy AI values based on the current schema
      const suggestions = {};
      const allFields = extractAllFields(sections);
      
      allFields.forEach(field => {
        let val = "AI Generated Text";
        if (field.type === 'date') val = "01/04/2025";
        else if (field.type === 'number' || field.type === 'currency') val = "500000";
        else if (field.type === 'radio' || field.type === 'select') {
           val = field.options && field.options.length > 0 ? field.options[0].value : "yes";
        }
        suggestions[field.attributeId] = val;
      });
      
      setValues(prev => ({
        ...prev,
        ...suggestions
      }));
      
      const newAiSet = new Set(aiFilledFields);
      Object.keys(suggestions).forEach(key => {
        newAiSet.add(Number(key)); // attributeId is usually numeric
      });
      setAiFilledFields(newAiSet);
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
    } finally {
      setLoading(false);
    }
  }, [formId, aiFilledFields, sections, extractAllFields]);

  // Check if a field should be visible based on its conditionalOn logic
  const isFieldVisible = useCallback((field) => {
    if (!field.conditionalOn) return true;
    
    const { fieldId, value: expectedValue } = field.conditionalOn;
    
    const allFields = extractAllFields(sections);
    const dependentField = allFields.find(f => f.fieldId === fieldId);
    
    if (dependentField) {
      const currentValue = values[dependentField.attributeId];
      return currentValue === expectedValue;
    }
    
    return true; 
  }, [sections, values, extractAllFields]);

  // Check if a field should be disabled based on its dependentOn logic
  const isFieldDisabled = useCallback((field) => {
    if (!field.dependentOn) return false;
    
    const dependentFieldId = field.dependentOn;
    const allFields = extractAllFields(sections);
    const dependentField = allFields.find(f => f.fieldId === dependentFieldId || f.attributeId == dependentFieldId);
    
    if (dependentField) {
      const currentValue = String(values[dependentField.attributeId] || '').trim().toLowerCase();
      
      let expectedValue = 'yes';
      if (field.dependencyRule) {
         const ruleStr = field.dependencyRule.toLowerCase();
         if (ruleStr.includes("'yes'") || ruleStr.includes('"yes"') || ruleStr.includes(' as yes')) {
            expectedValue = 'yes';
         } else if (ruleStr.includes("'no'") || ruleStr.includes('"no"') || ruleStr.includes(' as no')) {
            expectedValue = 'no';
         }
      }
      
      return currentValue !== expectedValue;
    }
    
    return false;
  }, [sections, values, extractAllFields]);

  // Prepare payload for submission
  const getFormPayload = useCallback(() => {
    return {
      formId,
      values
    };
  }, [formId, values]);
  
  // Save form
  const saveForm = useCallback(async () => {
    try {
      setLoading(true);
      const fieldsArray = [];

      Object.entries(values).forEach(([key, val]) => {
        if (Array.isArray(val)) {
          // It's a dynamic group array of entities
          val.forEach((entity, index) => {
            Object.entries(entity).forEach(([attrId, entityVal]) => {
              const parsedId = parseInt(attrId, 10);
              if (!isNaN(parsedId)) {
                fieldsArray.push({
                  attributeId: parsedId,
                  value: entityVal !== null && entityVal !== undefined ? String(entityVal) : null,
                  rowIndex: index
                });
              }
            });
          });
        } else {
          // Normal field
          const parsedId = parseInt(key, 10);
          if (!isNaN(parsedId)) {
            fieldsArray.push({
              attributeId: parsedId,
              value: val !== null && val !== undefined ? String(val) : null,
              rowIndex: 0
            });
          }
        }
      });

      // Clear previous errors first
      setSections(prevSections => {
        const clearErrors = (fields) => fields?.map(f => ({ ...f, validationMessage: null, validationStatus: null }));
        return prevSections.map(sec => ({
          ...sec,
          fields: clearErrors(sec.fields),
          additionalFields: clearErrors(sec.additionalFields),
          subsections: sec.subsections?.map(sub => ({
             ...sub,
             fields: clearErrors(sub.fields),
             additionalFields: clearErrors(sub.additionalFields)
          }))
        }));
      });

      await updateFormAttributeValuesBulk(formId, { fields: fieldsArray });
      alert("Form saved successfully!");
      return true;
    } catch (error) {
      console.error("Error saving form:", error);
      
      // If backend returns a 400 with validation errors array
      const errorPayload = error.data?.body?.errors || error.data?.body || error.data?.errors || error.data;
      if (error.status === 400 && Array.isArray(errorPayload)) {
        const errorList = errorPayload;
        
        // Map errors back to sections
        setSections(prevSections => {
          const applyErrors = (fields) => fields?.map(f => {
            const err = errorList.find(e => e.attributeId === f.attributeId);
            if (err) return { ...f, validationMessage: err.validationMessage || err.message, validationStatus: 'FAILED' };
            return f;
          });
          
          return prevSections.map(sec => ({
            ...sec,
            fields: applyErrors(sec.fields),
            additionalFields: applyErrors(sec.additionalFields),
            subsections: sec.subsections?.map(sub => ({
               ...sub,
               fields: applyErrors(sub.fields),
               additionalFields: applyErrors(sub.additionalFields)
            }))
          }));
        });
        
        alert("Validation Failed! Please check the fields highlighted in red.");
      } else {
        alert("Failed to save form. Check console.");
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [formTypeId, formId, values]);

  return {
    sections,
    values,
    aiFilledFields,
    loading,
    percentComplete,
    updateValue,
    applyAiSuggestions,
    isFieldVisible,
    isFieldDisabled,
    getFormPayload,
    saveForm
  };
}
