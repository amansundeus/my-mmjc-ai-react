import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiPlus, FiSave, FiX } from 'react-icons/fi'
import SectionCard from '../../components/SectionCard/SectionCard'
import FormField from '../../components/FormField/FormField'
import DataTable from '../../components/DataTable/DataTable'
import ActionButtons from '../../components/ActionButtons/ActionButtons'
import { getFormAttributes, saveFormAttributesBulk, updateFormAttribute, getFormAttributeById, createAttribute, deleteAttribute, copyAttribute, getFormTypeMasters, getTemplateMasters, getSourceMasters } from '../../services/api'
import './AttributeManagement.css'

function AttributeManagement() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [masterIds, setMasterIds] = useState({
    formTypeId: '',
    templateId: '',
    sourceId: '',
  })

  const [formTypeOptions, setFormTypeOptions] = useState([])
  const [templateOptions, setTemplateOptions] = useState([])
  const [sourceOptions, setSourceOptions] = useState([])

  // schema is an array of attributes
  const [schema, setSchema] = useState(null)
  
  // Track new attribute ID auto-increment locally
  const [nextAttrId, setNextAttrId] = useState(1000)

  // Editing modal state
  const [editingIndex, setEditingIndex] = useState(null)
  const [editingField, setEditingField] = useState(null)

  const handleMasterChange = (e) => {
    const { name, value } = e.target
    setMasterIds(prev => {
      const newIds = { ...prev, [name]: value };
      if (name === 'formTypeId') {
        newIds.templateId = '';
        newIds.sourceId = '';
      } else if (name === 'templateId') {
        newIds.sourceId = '';
      }
      return newIds;
    })
  }

  useEffect(() => {
    const fetchFormTypes = async () => {
      try {
        const res = await getFormTypeMasters();
        const data = res?.body?.data || res?.body?.content || (Array.isArray(res?.body) ? res.body : []) || (Array.isArray(res) ? res : []);
        setFormTypeOptions(data.map(item => ({
          value: item.id || item.formTypeMasterId || item.masterId || item.formTypeId || item.name,
          label: item.name || item.formName || item.masterName || item.formTypeName || `Form Type ${item.id}`
        })));
      } catch (err) {
        console.error("Failed to fetch form types", err);
      }
    };
    fetchFormTypes();
  }, []);

  useEffect(() => {
    const fetchTemplates = async () => {
      if (!masterIds.formTypeId) {
        setTemplateOptions([]);
        return;
      }
      try {
        const res = await getTemplateMasters(masterIds.formTypeId);
        const data = res?.body?.data || res?.body?.content || (Array.isArray(res?.body) ? res.body : []) || (Array.isArray(res) ? res : []);
        setTemplateOptions(data.map(item => ({
          value: item.id || item.templateMasterId || item.masterId || item.templateId || item.name,
          label: item.name || item.templateName || item.masterName || `Template ${item.id}`
        })));
      } catch (err) {
        console.error("Failed to fetch templates", err);
      }
    };
    fetchTemplates();
  }, [masterIds.formTypeId]);

  useEffect(() => {
    const fetchSources = async () => {
      if (!masterIds.templateId) {
        setSourceOptions([]);
        return;
      }
      try {
        const res = await getSourceMasters(masterIds.templateId);
        const data = res?.body?.data || res?.body?.content || (Array.isArray(res?.body) ? res.body : []) || (Array.isArray(res) ? res : []);
        setSourceOptions(data.map(item => ({
          value: item.id || item.sourceMasterId || item.masterId || item.sourceId || item.name,
          label: item.name || item.sourceName || item.masterName || `Source ${item.id}`
        })));
      } catch (err) {
        console.error("Failed to fetch sources", err);
      }
    };
    fetchSources();
  }, [masterIds.templateId]);

  const handleLoadAttributes = async () => {
    try {
      setLoading(true)
      const res = await getFormAttributes(masterIds.formTypeId, masterIds.templateId, masterIds.sourceId)
      
      let finalFields = []

      // Extract fields helper if response is structured with sections/tables
      const extractFields = (sections) => {
        let extracted = []
        const traverseFields = (fields) => {
          if (fields) extracted.push(...fields)
        }
        const traverseTables = (tables) => {
          if (!tables) return
          tables.forEach(table => {
            if (table.rows) {
              table.rows.forEach(row => {
                if (row.cells) {
                  row.cells.forEach(cell => {
                    if (cell.attributeId || cell.fieldId) {
                      const col = (table.columns || []).find(c => c.columnId === cell.columnKey) || {}
                      extracted.push({
                        ...cell,
                        label: cell.label || col.header || row.fieldTitle || table.tableTitle || cell.columnKey || '',
                        fieldId: cell.fieldId || (row.fieldId ? `${row.fieldId}_${cell.columnKey}` : cell.columnKey),
                        type: cell.type || col.type || 'table_cell',
                        required: cell.required !== undefined ? cell.required : row.required,
                      })
                    }
                  })
                }
              })
            }
          })
        }
        
        sections.forEach(sec => {
          traverseFields(sec.fields)
          traverseTables(sec.tables)
          if (sec.subsections) {
            sec.subsections.forEach(subsec => {
              traverseFields(subsec.fields)
              traverseTables(subsec.tables)
            })
          }
        })
        return extracted
      }

      if (res && Array.isArray(res.body)) {
        // Map the new flat structure properties to what the DataTable expects
        finalFields = res.body.map(attr => ({
          ...attr,
          attributeId: attr.id,
          label: attr.name,
          type: attr.fieldType || 'text',
          fieldId: attr.fieldNo || `field_${attr.id}`,
          required: attr.isMandatory || false,
        }))
      } else if (res && res.body && Array.isArray(res.body.content)) {
        finalFields = res.body.content
      } else if (res && res.body && Array.isArray(res.body.data)) {
        finalFields = res.body.data
      } else if (Array.isArray(res)) {
        finalFields = res.map(attr => ({
          ...attr,
          attributeId: attr.id || attr.attributeId,
          label: attr.name || attr.label,
          type: attr.fieldType || attr.type || 'text',
          fieldId: attr.fieldNo || attr.fieldId || `field_${attr.id}`,
          required: attr.isMandatory !== undefined ? attr.isMandatory : (attr.required || false),
        }))
      } else if (res && res.body && res.body.sections) {
        finalFields = extractFields(res.body.sections)
      }

      setSchema(finalFields)
    } catch (err) {
      console.error('Error loading attributes', err)
      setSchema([])
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAttributes = async () => {
    if (!schema) return
    try {
      setSaving(true)
      await saveFormAttributesBulk(masterIds.formTypeId, schema)
      alert('Schema saved successfully!')
    } catch (err) {
      console.error('Error saving attributes', err)
      alert('Failed to save schema.')
    } finally {
      setSaving(false)
    }
  }

  const handleAddField = () => {
    const currentAttrId = nextAttrId
    setNextAttrId(currentAttrId + 1)
    
    const newField = {
      attributeId: `new_${currentAttrId}`,
      isNew: true,
      fieldId: `field_${currentAttrId}`,
      label: 'New Field',
      type: 'text',
      format: null,
      placeholder: '',
      required: false,
      gridColumn: 1,
      formTypeMasterId: masterIds.formTypeId,
    }
    setSchema([...(schema || []), newField])
  }

  const handlePasteField = () => {
    const copiedData = localStorage.getItem('mmjc_copied_attribute');
    if (!copiedData) {
      alert('No field found in clipboard to paste!');
      return;
    }

    try {
      const parsedField = JSON.parse(copiedData);
      const currentAttrId = nextAttrId;
      setNextAttrId(currentAttrId + 1);

      // Strip original IDs and assign to current form
      const pastedField = {
        ...parsedField,
        id: undefined, // remove backend id
        attributeId: `new_${currentAttrId}`,
        fieldId: `field_${currentAttrId}`,
        isNew: true,
        formTypeMasterId: masterIds.formTypeId, // assign to current form type
        label: `${parsedField.name || parsedField.label} (Copy)`
      };

      setSchema([...(schema || []), pastedField]);
      alert('Field pasted successfully! Please review and save the schema.');
    } catch (e) {
      console.error('Failed to parse copied field', e);
      alert('Failed to paste field. Invalid data in clipboard.');
    }
  }

  const openEditModal = async (index) => {
    const fallbackField = schema[index];
    
    if (fallbackField.isNew) {
      const initSortOrder = fallbackField.sortOrder ?? fallbackField.sort_order ?? 0;
      setEditingField({ ...fallbackField, sortOrder: Number(initSortOrder).toFixed(3) });
      setEditingIndex(index);
      return;
    }

    const attributeId = fallbackField.id || fallbackField.attributeId;
    if (attributeId) {
      try {
        setLoading(true);
        const res = await getFormAttributeById(attributeId);
        const fullData = res.body || res;
        
        // Strip null/undefined from fullData so we don't overwrite valid fallback values
        const cleanedData = {};
        for (const key in fullData) {
          if (fullData[key] !== null && fullData[key] !== undefined && fullData[key] !== '') {
            cleanedData[key] = fullData[key];
          }
        }
        
        let initSortOrder = cleanedData.sortOrder ?? cleanedData.sort_order ?? fallbackField.sortOrder ?? fallbackField.sort_order ?? 0;
        
        setEditingField({ ...fallbackField, ...cleanedData, sortOrder: Number(initSortOrder).toFixed(3) });
        setEditingIndex(index);
      } catch (err) {
        console.error('Failed to fetch full attribute details', err);
        setEditingField({ ...fallbackField });
        setEditingIndex(index);
      } finally {
        setLoading(false);
      }
    } else {
      setEditingField({ ...fallbackField });
      setEditingIndex(index);
    }
  }

  const closeEditModal = () => {
    setEditingIndex(null)
    setEditingField(null)
  }

  const handleModalChange = (key, value) => {
    setEditingField(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveModal = async () => {
    try {
      const payload = {
        name: editingField.name || editingField.label,
        fieldNo: editingField.fieldNo ?? editingField.field_no ?? editingField.fieldId,
        sortOrder: parseFloat(editingField.sortOrder ?? editingField.sort_order ?? 0),
        charLimit: editingField.charLimit ?? editingField.char_limit,
        isEditable: editingField.isEditable !== false && editingField.is_editable !== false,
        isMandatory: editingField.isMandatory || editingField.is_mandatory || editingField.required || false,
        dependentOn: editingField.dependent_on,
        dependencyRule: editingField.dependency_rule,
        sourceFetchField: editingField.source_fetch_field,
        aoc4FieldRef: editingField.aoc4_field_ref,
        masterToUpdate: editingField.master_to_update,
        masterFieldRef: editingField.master_field_ref,
        searchKeywords: editingField.search_keywords,
        fieldSpecJson: editingField.field_spec_json,
        sectionMasterId: editingField.sectionMasterId ?? editingField.section_master_id,
        filingTypeMasterId: editingField.filingTypeMasterId ?? editingField.filing_type_master_id,
        datatypeMasterId: editingField.datatypeMasterId ?? editingField.datatype_master_id,
        formTypeMasterId: editingField.formTypeMasterId ?? editingField.form_type_master_id,
        templateMasterId: editingField.templateMasterId ?? editingField.template_master_id,
        sourceMasterId: editingField.sourceMasterId ?? editingField.source_master_id,
        renderType: editingField.renderType ?? editingField.render_type,
        fieldType: editingField.field_type || editingField.type,
        format: editingField.format,
        gridColumn: Number(editingField.grid_column || editingField.gridColumn || 1),
        placeholder: editingField.placeholder,
        prefix: editingField.prefix,
        defaultValue: editingField.default_value || editingField.defaultValue,
        optionsJson: editingField.options_json,
        conditionalOnField: editingField.conditional_on_field,
        conditionalOnValue: editingField.conditional_on_value,
        elementGroupKey: editingField.element_group_key,
        elementGroupTitle: editingField.element_group_title,
        elementGroupType: editingField.element_group_type,
        columnKey: editingField.column_key || editingField.columnKey,
        columnHeader: editingField.column_header,
        parentColumnKey: editingField.parent_column_key,
        parentColumnHeader: editingField.parent_column_header,
        addButtonLabel: editingField.addButtonLabel ?? editingField.add_button_label,
        entityLabelPrefix: editingField.entityLabelPrefix ?? editingField.entity_label_prefix,
        highlight: editingField.highlight
      };

      // Ensure undefined fields are removed so we don't send garbage
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

      const attributeId = editingField.id || editingField.attributeId;
      let savedField = { ...editingField };

      if (editingField.isNew || !attributeId || String(attributeId).startsWith('new_')) {
        const res = await createAttribute(payload);
        const newData = res.body || res;
        savedField = { ...savedField, ...newData, isNew: false };
        alert('Attribute created successfully!');
      } else {
        await updateFormAttribute(attributeId, payload);
        alert('Attribute updated successfully!');
      }

      const updated = [...schema]
      updated[editingIndex] = savedField
      setSchema(updated)
      closeEditModal()
    } catch (err) {
      console.error('Error saving attribute', err)
      alert('Failed to update attribute.')
    }
  }

  const handleCopyField = async (index) => {
    const fieldToCopy = schema[index];
    
    // Save to local storage for cross-form pasting
    localStorage.setItem('mmjc_copied_attribute', JSON.stringify(fieldToCopy));
    alert('Field copied to clipboard! You can now go to another Form Type and paste it.');
  };

  const handleRemoveField = async (index) => {
    if (window.confirm("Are you sure you want to delete this field?")) {
      const fieldToDelete = schema[index];
      const attributeId = fieldToDelete.id || fieldToDelete.attributeId;
      
      if (!fieldToDelete.isNew && attributeId && !String(attributeId).startsWith('new_')) {
        try {
          await deleteAttribute(attributeId);
          alert('Attribute deleted successfully!');
        } catch (err) {
          console.error('Failed to delete attribute', err);
          alert('Failed to delete attribute from server. It will be removed from the UI.');
        }
      }

      const updated = [...schema]
      updated.splice(index, 1)
      setSchema(updated)
    }
  }

  // DataTable columns
  const columns = [
    { key: 'attributeId', label: 'Attribute ID' },
    { 
      key: 'label', 
      label: 'Label',
      render: (value) => (
        <div style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={value}>
          {value}
        </div>
      )
    },
    { key: 'type', label: 'Type' },
    { 
      key: 'fieldId', 
      label: 'Field ID',
      render: (value) => (
        <div style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'action',
      label: 'Action',
      render: (_, row, index) => (
        <ActionButtons
          actions={['edit', 'copy', 'delete']}
          onAction={(action) => {
            if (action === 'edit') {
              openEditModal(index)
            } else if (action === 'copy') {
              handleCopyField(index)
            } else if (action === 'delete') {
              handleRemoveField(index)
            }
          }}
        />
      ),
    },
  ]

  // We need to inject the index so DataTable render gets it if it's not provided by row ID.
  // Actually, DataTable render usually passes (value, row). We can find the index or map data to include originalIndex.
  const tableData = (schema || []).map((row, idx) => ({ ...row, originalIndex: idx }))
  
  // Update columns to use originalIndex
  const columnsWithIndex = columns.map(col => {
    if (col.key === 'action') {
      return {
        ...col,
        render: (_, row) => (
          <ActionButtons
            actions={['edit', 'copy', 'delete']}
            onAction={(action) => {
              if (action === 'edit') {
                openEditModal(row.originalIndex)
              } else if (action === 'copy') {
                handleCopyField(row.originalIndex)
              } else if (action === 'delete') {
                handleRemoveField(row.originalIndex)
              }
            }}
          />
        )
      }
    }
    return col
  })

  return (
    <div className="attribute-management">
      <div className="attribute-management__container">
        
        {/* Header */}
        <div className="attribute-management__header">
          <button className="attribute-management__back-btn" onClick={() => navigate('/')}>
            <FiArrowLeft size={18} />
          </button>
          <h1 className="attribute-management__title">Attribute Management</h1>
        </div>

        {/* Master Selection */}
        <SectionCard title="Master Selection" variant="blue" className="animate-fadeIn">
          <div className="attribute-management__master-grid">
            <FormField 
              label="Form Type Master" 
              name="formTypeId"
              type="select" 
              value={masterIds.formTypeId} 
              onChange={handleMasterChange} 
              options={formTypeOptions}
              placeholder="Select Form Type"
            />

          </div>
          <div className="attribute-management__actions">
            <button 
              className="btn btn-primary"
              onClick={handleLoadAttributes}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load Attributes'}
            </button>
          </div>
        </SectionCard>

        {/* Schema Editor via DataTable */}
        {schema && (
          <div className="attribute-management__schema-editor animate-slideIn">
            <div className="attribute-management__schema-header">
              <h2>Schema Fields</h2>
              <div className="attribute-management__schema-actions">
                <button className="btn btn-outline" onClick={handleAddField}>
                  <FiPlus size={16} /> Add Field
                </button>
                <button className="btn btn-outline" onClick={handlePasteField} title="Paste copied field">
                  Paste Field
                </button>
                <button className="btn btn-success" onClick={handleSaveAttributes} disabled={saving}>
                  <FiSave size={16} /> {saving ? 'Saving...' : 'Save Schema'}
                </button>
              </div>
            </div>

            <SectionCard>
              {schema.length === 0 ? (
                <p className="attribute-management__empty">No fields found. Add one to get started.</p>
              ) : (
                <DataTable
                  columns={columnsWithIndex}
                  data={tableData}
                  selectable={false}
                  pagination={true}
                  itemsPerPage={25}
                />
              )}
            </SectionCard>
          </div>
        )}
      </div>

      {/* Edit Field Modal */}
      {editingField && (
        <div className="attribute-modal-overlay">
          <div className="attribute-modal attribute-modal--large animate-slideIn">
            <div className="attribute-modal-header">
              <h3>Edit Field Details</h3>
              <button className="icon-btn" onClick={closeEditModal}><FiX size={20}/></button>
            </div>
            <div className="attribute-modal-body">
              
              {/* Basic Details */}
              <fieldset className="attribute-modal-fieldset">
                <legend>Basic Details</legend>
                <div className="attribute-modal-grid">
                  <FormField label="Name / Label" value={editingField.name || editingField.label || ''} onChange={(e) => { handleModalChange('name', e.target.value); handleModalChange('label', e.target.value); }} />
                  <FormField label="Field No" value={editingField.fieldNo ?? editingField.field_no ?? editingField.fieldId ?? ''} onChange={(e) => handleModalChange('fieldNo', e.target.value)} />
                  <FormField label="Sort Order" type="number" step="0.001" value={editingField.sortOrder ?? editingField.sort_order ?? ''} onChange={(e) => handleModalChange('sortOrder', e.target.value)} />
                  <FormField label="Character Limit" value={editingField.charLimit ?? editingField.char_limit ?? ''} onChange={(e) => handleModalChange('charLimit', e.target.value)} />
                  <FormField label="Highlight" value={editingField.highlight || ''} onChange={(e) => handleModalChange('highlight', e.target.value)} />
                  
                  <div className="form-field form-field-checkbox">
                    <label className="form-field__label">
                      <input type="checkbox" checked={editingField.isEditable !== false && editingField.is_editable !== false} onChange={(e) => handleModalChange('isEditable', e.target.checked)} style={{ marginRight: '8px' }} />
                      Is Editable
                    </label>
                  </div>
                  <div className="form-field form-field-checkbox">
                    <label className="form-field__label">
                      <input type="checkbox" checked={editingField.isMandatory || editingField.is_mandatory || editingField.required || false} onChange={(e) => { handleModalChange('isMandatory', e.target.checked); handleModalChange('required', e.target.checked); }} style={{ marginRight: '8px' }} />
                      Is Mandatory
                    </label>
                  </div>
                </div>
              </fieldset>

              {/* Render & UI Rules */}
              <fieldset className="attribute-modal-fieldset">
                <legend>Render & UI Rules</legend>
                <div className="attribute-modal-grid">
                  <div className="form-field">
                    <label className="form-field__label">Field Type</label>
                    <select className="form-field__input" value={editingField.fieldType || editingField.field_type || editingField.type || 'text'} onChange={(e) => { handleModalChange('fieldType', e.target.value); handleModalChange('type', e.target.value); }}>
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="currency">Currency</option>
                      <option value="date">Date</option>
                      <option value="select">Select/Dropdown</option>
                      <option value="radio">Radio</option>
                      <option value="checkbox">Checkbox</option>
                      <option value="table_cell">Table Cell</option>
                    </select>
                  </div>
                  <FormField label="Render Type" value={editingField.renderType ?? editingField.render_type ?? ''} onChange={(e) => handleModalChange('renderType', e.target.value)} />
                  <FormField label="Format" value={editingField.format || ''} onChange={(e) => handleModalChange('format', e.target.value)} placeholder="e.g. DD/MM/YYYY" />
                  <FormField label="Grid Column" type="number" value={editingField.gridColumn ?? editingField.grid_column ?? ''} onChange={(e) => handleModalChange('gridColumn', e.target.value)} />
                  <FormField label="Placeholder" value={editingField.placeholder || ''} onChange={(e) => handleModalChange('placeholder', e.target.value)} />
                  <FormField label="Prefix" value={editingField.prefix || ''} onChange={(e) => handleModalChange('prefix', e.target.value)} />
                  <FormField label="Default Value" value={editingField.defaultValue ?? editingField.default_value ?? ''} onChange={(e) => handleModalChange('defaultValue', e.target.value)} />
                  
                  <div className="form-field attribute-modal-textarea">
                    <label className="form-field__label">Options JSON</label>
                    <textarea value={editingField.optionsJson ?? editingField.options_json ?? (editingField.options ? JSON.stringify(editingField.options) : '')} onChange={(e) => handleModalChange('optionsJson', e.target.value)} placeholder='[{"label": "Yes", "value": "yes"}]'></textarea>
                  </div>
                  <div className="form-field attribute-modal-textarea">
                    <label className="form-field__label">Field Spec JSON</label>
                    <textarea value={editingField.fieldSpecJson ?? editingField.field_spec_json ?? ''} onChange={(e) => handleModalChange('fieldSpecJson', e.target.value)} placeholder="{...}"></textarea>
                  </div>
                </div>
              </fieldset>

              {/* Dependencies & Conditions */}
              <fieldset className="attribute-modal-fieldset">
                <legend>Dependencies & Conditions</legend>
                <div className="attribute-modal-grid">
                  <FormField label="Dependent On" value={editingField.dependentOn ?? editingField.dependent_on ?? ''} onChange={(e) => handleModalChange('dependentOn', e.target.value)} />
                  <FormField label="Conditional On Field" value={editingField.conditionalOnField ?? editingField.conditional_on_field ?? ''} onChange={(e) => handleModalChange('conditionalOnField', e.target.value)} />
                  <FormField label="Conditional On Value" value={editingField.conditionalOnValue ?? editingField.conditional_on_value ?? ''} onChange={(e) => handleModalChange('conditionalOnValue', e.target.value)} />
                  
                  <div className="form-field attribute-modal-textarea">
                    <label className="form-field__label">Dependency Rule / Business Rule</label>
                    <textarea value={editingField.dependencyRule ?? editingField.dependency_rule ?? ''} onChange={(e) => handleModalChange('dependencyRule', e.target.value)}></textarea>
                  </div>
                </div>
              </fieldset>

              {/* Groups & Columns */}
              <fieldset className="attribute-modal-fieldset">
                <legend>Groups & Columns</legend>
                <div className="attribute-modal-grid">
                  <FormField label="Element Group Key" value={editingField.elementGroupKey ?? editingField.element_group_key ?? ''} onChange={(e) => handleModalChange('elementGroupKey', e.target.value)} />
                  <FormField label="Element Group Title" value={editingField.elementGroupTitle ?? editingField.element_group_title ?? ''} onChange={(e) => handleModalChange('elementGroupTitle', e.target.value)} />
                  <FormField label="Element Group Type" value={editingField.elementGroupType ?? editingField.element_group_type ?? ''} onChange={(e) => handleModalChange('elementGroupType', e.target.value)} />
                  <FormField label="Column Key" value={editingField.columnKey ?? editingField.column_key ?? ''} onChange={(e) => handleModalChange('columnKey', e.target.value)} />
                  <FormField label="Column Header" value={editingField.columnHeader ?? editingField.column_header ?? ''} onChange={(e) => handleModalChange('columnHeader', e.target.value)} />
                  <FormField label="Parent Column Key" value={editingField.parentColumnKey ?? editingField.parent_column_key ?? ''} onChange={(e) => handleModalChange('parentColumnKey', e.target.value)} />
                  <FormField label="Parent Column Header" value={editingField.parentColumnHeader ?? editingField.parent_column_header ?? ''} onChange={(e) => handleModalChange('parentColumnHeader', e.target.value)} />
                  <FormField label="Add Button Label" value={editingField.addButtonLabel ?? editingField.add_button_label ?? ''} onChange={(e) => handleModalChange('addButtonLabel', e.target.value)} />
                  <FormField label="Entity Label Prefix" value={editingField.entityLabelPrefix ?? editingField.entity_label_prefix ?? ''} onChange={(e) => handleModalChange('entityLabelPrefix', e.target.value)} />
                </div>
              </fieldset>

              {/* Data Mapping & Search */}
              <fieldset className="attribute-modal-fieldset">
                <legend>Data Mapping & Search</legend>
                <div className="attribute-modal-grid">
                  <FormField label="Source Fetch Field" value={editingField.sourceFetchField ?? editingField.source_fetch_field ?? ''} onChange={(e) => handleModalChange('sourceFetchField', e.target.value)} />
                  <FormField label="AOC4 Field Ref" value={editingField.aoc4FieldRef ?? editingField.aoc4_field_ref ?? ''} onChange={(e) => handleModalChange('aoc4FieldRef', e.target.value)} />
                  <FormField label="Master To Update" value={editingField.masterToUpdate ?? editingField.master_to_update ?? ''} onChange={(e) => handleModalChange('masterToUpdate', e.target.value)} />
                  <FormField label="Master Field Ref" value={editingField.masterFieldRef ?? editingField.master_field_ref ?? ''} onChange={(e) => handleModalChange('masterFieldRef', e.target.value)} />
                  <div className="form-field attribute-modal-textarea">
                    <label className="form-field__label">Search Keywords</label>
                    <textarea value={editingField.searchKeywords ?? editingField.search_keywords ?? ''} onChange={(e) => handleModalChange('searchKeywords', e.target.value)}></textarea>
                  </div>
                </div>
              </fieldset>

              {/* System & Masters (Read-only/IDs) */}
              <fieldset className="attribute-modal-fieldset">
                <legend>System & Masters</legend>
                <div className="attribute-modal-grid">
                  <FormField label="Attribute ID" value={editingField.id || editingField.attributeId || ''} disabled />
                  <FormField label="Field ID (UI)" value={editingField.fieldId || ''} disabled />
                  <FormField label="Section Master ID" value={editingField.sectionMasterId ?? editingField.section_master_id ?? ''} onChange={(e) => handleModalChange('sectionMasterId', e.target.value)} />
                  <FormField label="Filing Type Master ID" value={editingField.filingTypeMasterId ?? editingField.filing_type_master_id ?? ''} onChange={(e) => handleModalChange('filingTypeMasterId', e.target.value)} />
                  <FormField label="Datatype Master ID" value={editingField.datatypeMasterId ?? editingField.datatype_master_id ?? ''} onChange={(e) => handleModalChange('datatypeMasterId', e.target.value)} />
                  <FormField label="Form Type Master ID" value={editingField.formTypeMasterId ?? editingField.form_type_master_id ?? ''} onChange={(e) => handleModalChange('formTypeMasterId', e.target.value)} />
                  <FormField label="Template Master ID" value={editingField.templateMasterId ?? editingField.template_master_id ?? ''} onChange={(e) => handleModalChange('templateMasterId', e.target.value)} />
                  <FormField label="Source Master ID" value={editingField.sourceMasterId ?? editingField.source_master_id ?? ''} onChange={(e) => handleModalChange('sourceMasterId', e.target.value)} />
                </div>
              </fieldset>

            </div>
            <div className="attribute-modal-footer">
              <button className="btn btn-outline" onClick={closeEditModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveModal}>Save Details</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AttributeManagement
