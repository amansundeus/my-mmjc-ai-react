import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiUpload, FiTrash2, FiPlus, FiDownload } from 'react-icons/fi';
import Stepper from '../../components/Stepper/Stepper';
import FormField from '../../components/FormField/FormField';
import DataTable from '../../components/DataTable/DataTable';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { getCompaniesDropdown, getTeams, getFormTypeMasters, getIrlFormsList, generateTemplate, downloadTemplate, getSourceMasters, getTemplateMasters, getIrlFormById, uploadIrlDocument, getFormsList, createOrUpdateFormWithDocuments } from '../../services/api';
import './UploadTemplate.css';

const STEPS = ['Create IRL', 'View IRL', 'Fill Form', 'Upload Template'];

const financialYearOptions = [
  { label: 'FY23-24', value: 'FY23-24' },
  { label: 'FY24-25', value: 'FY24-25' },
  { label: 'FY25-26', value: 'FY25-26' },
  { label: 'FY26-27', value: 'FY26-27' },
];

function UploadTemplate() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedIrl = location.state?.selectedIrl || null;

  const [formData, setFormData] = useState({
    companyName: selectedIrl?.companyName || '',
    companyId: selectedIrl?.companyId || '',
    cin: selectedIrl?.cin || '',
    financialYear: selectedIrl?.financialYear || '',
    teamName: selectedIrl?.teamName || '',
    teamId: selectedIrl?.teamId || '',
    selectForm: selectedIrl?.formTypeMasterName || selectedIrl?.irlName || '',
    formTypeMasterId: selectedIrl?.formTypeMasterId || '',
    templateName: selectedIrl?.templateName || '',
    documentName: selectedIrl?.documentName || ''
  });

  const [dropdownCompanies, setDropdownCompanies] = useState([]);
  const [dropdownTeams, setDropdownTeams] = useState([]);
  const [dropdownFormTypes, setDropdownFormTypes] = useState([]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [compRes, teamRes, formRes] = await Promise.all([
          getCompaniesDropdown().catch(() => ({ body: [] })),
          getTeams().catch(() => ({ body: { content: [] } })),
          getFormTypeMasters().catch(() => ({ body: [] }))
        ]);
        
        setDropdownCompanies(compRes?.body || []);
        setDropdownTeams(teamRes?.body?.content || teamRes?.body?.data || []);
        setDropdownFormTypes(formRes?.body || []);
      } catch (err) {
        console.error('Failed to fetch dropdowns:', err);
      }
    };
    fetchDropdowns();
  }, []);

  const updateField = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === 'companyId') {
      const selected = dropdownCompanies.find(c => (c.companyId || c.id)?.toString() === value?.toString());
      if (selected) {
        setFormData(prev => ({ ...prev, companyId: selected.companyId || selected.id, companyName: selected.companyName || selected.name, cin: selected.cin || '' }));
      }
    } else if (field === 'teamId') {
      const selected = dropdownTeams.find(t => (t.teamId || t.id)?.toString() === value?.toString());
      if (selected) {
        setFormData(prev => ({ ...prev, teamId: selected.teamId || selected.id, teamName: selected.teamName || selected.name }));
      }
    } else if (field === 'formTypeMasterId') {
      const selected = dropdownFormTypes.find(f => (f.formTypeMasterId || f.id)?.toString() === value?.toString());
      if (selected) {
        setFormData(prev => ({ ...prev, formTypeMasterId: selected.formTypeMasterId || selected.id, selectForm: selected.formTypeMasterName || selected.name }));
      }
    }
  };

  const dynamicCompanyOptions = dropdownCompanies.map(c => ({ label: c.companyName || c.name, value: c.companyId || c.id }));
  const dynamicTeamOptions = dropdownTeams.map(t => ({ label: t.teamName || t.name, value: t.teamId || t.id }));
  const dynamicFormOptions = dropdownFormTypes.map(f => ({ label: f.formTypeMasterName || f.name, value: f.formTypeMasterId || f.id }));
  const [sourceFiles, setSourceFiles] = useState([]);
  const [templateFiles, setTemplateFiles] = useState([]);

  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [templateSuggestions, setTemplateSuggestions] = useState([]);
  const [fullIrlDetails, setFullIrlDetails] = useState(null);

  useEffect(() => {
    const targetId = selectedIrl?.irlId || selectedIrl?.formId || selectedIrl?.id || formData.formId;
    if (targetId) {
      getIrlFormById(targetId)
        .then(res => {
          if (res) {
            const body = res.body || res;
            setFullIrlDetails(body);
            
            const docs = body.documents || body.irlDocuments || (Array.isArray(body) ? body : []);
            if (docs && Array.isArray(docs)) {
              const fetchedSources = [];
              const fetchedTemplates = [];

              docs.forEach((doc, idx) => {
                const fileObj = {
                  id: doc.id || doc.documentId || `prev-${idx}`,
                  name: doc.documentName || doc.fileName || doc.file_name || 'Uploaded Document',
                  type: (doc.documentName || '').endsWith('.xlsx') ? 'excel' : 'pdf',
                  url: doc.documentUrl || doc.fileUrl || doc.file_url,
                  isPreUploaded: true,
                  docType: doc.docType || 'Source'
                };

                if (fileObj.docType.toLowerCase() === 'template') {
                  fetchedTemplates.push(fileObj);
                } else {
                  fetchedSources.push(fileObj);
                }
              });

              setSourceFiles(fetchedSources);
              setTemplateFiles(fetchedTemplates);
            }
          }
        })
        .catch(err => console.error('Failed to fetch full IRL details:', err));
    }
  }, [selectedIrl, formData.formId]);

  const [formsData, setFormsData] = useState([]);
  const [isGenerating, setIsGenerating] = useState({});
  const [generatedForms, setGeneratedForms] = useState({});

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const tId = fullIrlDetails?.templateMasterId || selectedIrl?.templateMasterId || selectedIrl?.templateId || formData.templateMasterId;
        if (!tId) {
          setSourceSuggestions([]);
          return;
        }
        const res = await getSourceMasters(tId);
        if (res?.body) {
          const raw = Array.isArray(res.body) ? res.body : (res.body.data || res.body.content || []);
          const mapped = raw.map((item, idx) => ({
            id: item.sourceMasterId || item.id || idx,
            name: item.sourceName || item.name || 'Source Document',
            type: 'pdf' // generic fallback
          }));
          setSourceSuggestions(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch source masters:', err);
      }
    };
    fetchSources();
  }, [selectedIrl, formData.templateMasterId, fullIrlDetails]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const fId = fullIrlDetails?.formTypeMasterId || formData.formTypeMasterId || selectedIrl?.formTypeMasterId;
        const targetTId = fullIrlDetails?.templateMasterId || selectedIrl?.templateMasterId || selectedIrl?.templateId || formData.templateMasterId;
        
        if (!fId) {
          setTemplateSuggestions([]);
          return;
        }
        
        const res = await getTemplateMasters(fId);
        if (res?.body) {
          let raw = Array.isArray(res.body) ? res.body : (res.body.data || res.body.content || []);
          
          if (targetTId) {
            raw = raw.filter(t => (t.templateMasterId || t.id)?.toString() === targetTId.toString());
          }
          
          const mapped = raw.map((item, idx) => ({
            id: item.templateMasterId || item.id || idx,
            name: item.templateName || item.name || 'Blank Template',
            type: 'word' // generic fallback
          }));
          setTemplateSuggestions(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch template masters:', err);
      }
    };
    fetchTemplates();
  }, [formData.formTypeMasterId, selectedIrl, fullIrlDetails]);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await getFormsList(formData.formTypeMasterId || 1);
        if (response?.body) {
          const rawData = response?.body?.data || response?.body?.content || (Array.isArray(response.body) ? response.body : []);
          const mappedList = rawData.map((item, index) => {
            const templateObj = item.templates && item.templates.length > 0 ? item.templates[0] : {};
            return {
              id: item.id || index,
              irlId: item.id || item.formId,
              formName: item.formTypeMasterName || item.formName || '-',
              companyName: item.companyName || '-',
              cin: item.cin || '-',
              financialYear: item.financialYear || '-',
              teamName: item.teamName || '-',
              templateName: templateObj.templateMasterName || item.templateName || '-',
              templateId: templateObj.id || null,
              templateMasterId: templateObj.templateMasterId || item.templateMasterId || 1,
              status: templateObj.templateStatus || item.formStatus || 'Pending'
            };
          });
          setFormsData(mappedList);
        }
      } catch (err) {
        console.error('Failed to fetch forms list:', err);
      }
    };
    fetchForms();
  }, [formData.formTypeMasterId]);

  const handleTemplateNumberChange = (id, value) => {
    setFormsData(prev => prev.map(row => row.id === id ? { ...row, templateNumber: value } : row));
  };



  const handleSourceUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    for (const file of files) {
      setSourceFiles(prev => [...prev, {
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.name.endsWith('.xlsx') ? 'excel' : 'pdf',
        url: '',
        isPreUploaded: false,
        rawFile: file
      }]);
    }
  };

  const handleTemplateUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      setTemplateFiles(prev => [...prev, {
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.name.endsWith('.xlsx') ? 'excel' : 'pdf',
        url: '',
        isPreUploaded: false,
        rawFile: file
      }]);
    }
  };

  const handleSubmitAdd = async () => {
    try {
      const targetFormId = selectedIrl?.irlId || selectedIrl?.formId || selectedIrl?.id || formData.formId;

      const metadata = {
        companyName: formData.companyName || fullIrlDetails?.companyName,
        cin: formData.cin || fullIrlDetails?.cin,
        financialYear: formData.financialYear || fullIrlDetails?.financialYear,
        teamName: formData.teamName || fullIrlDetails?.teamName,
        formTypeMasterId: formData.formTypeMasterId || fullIrlDetails?.formTypeMasterId || "1",
        templateMasterId: formData.templateMasterId || fullIrlDetails?.templateMasterId || "1",
        irlFormId: targetFormId || null,
        formId: targetFormId || null
      };
      
      const sourcesToUpload = sourceFiles.filter(f => f.rawFile).map(f => f.rawFile);
      const templatesToUpload = templateFiles.filter(f => f.rawFile).map(f => f.rawFile);
      const templateToUpload = templatesToUpload.length > 0 ? templatesToUpload[0] : null;

      // Ensure any newly selected documents are uploaded to the IRL form first
      if (targetFormId) {
        for (const f of sourcesToUpload) {
          await uploadIrlDocument(targetFormId, f, 'Source');
        }
        for (const f of templatesToUpload) {
          await uploadIrlDocument(targetFormId, f, 'Template');
        }
      }

      // Then call POST /mmjc-ai/form to create the legacy form entry
      await createOrUpdateFormWithDocuments(metadata, sourcesToUpload, templateToUpload);
      alert("Form added successfully!");
      
      // Force trigger refetch of forms list
      setFormData(prev => ({ ...prev }));

      // Force trigger refetch of forms list
      setFormData(prev => ({ ...prev }));
    } catch (err) {
      console.error(err);
      alert("Failed to submit form and documents: " + err.message);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSourceDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleSourceUpload({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleTemplateDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleTemplateUpload({ target: { files: e.dataTransfer.files } });
    }
  };

  const removeSourceFile = (id) => {
    setSourceFiles(prev => prev.filter(f => f.id !== id));
  };

  const removeTemplateFile = (id) => {
    setTemplateFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleGenerateTemplate = async (row) => {
    try {
      setIsGenerating(prev => ({ ...prev, [row.id]: true }));
      
      const idToPass = row.templateId || row.irlId;
      await generateTemplate(idToPass);
      
      setGeneratedForms(prev => ({ ...prev, [row.id]: true }));
      setFormsData(prev => prev.map(f => f.id === row.id ? { ...f, status: 'GENERATED' } : f));
      alert('Template generated successfully via Java API!');
    } catch (err) {
      console.error('Failed to generate template:', err);
      alert('Failed to generate template');
    } finally {
      setIsGenerating(prev => ({ ...prev, [row.id]: false }));
    }
  };

  const handleDownloadTemplate = async (row) => {
    try {
      if (!row.templateId) {
        alert("No template ID available for this form.");
        return;
      }
      const { blob, filename } = await downloadTemplate(row.templateId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `${row.formName}_${row.companyName}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download template:', err);
      alert('Failed to download template');
    }
  };

  const columns = [
    { key: 'formName', label: 'Form Name' },
    { key: 'companyName', label: 'Company Name' },
    { key: 'cin', label: 'CIN' },
    { key: 'financialYear', label: 'Financial Year' },
    { key: 'teamName', label: 'Team Name' },
    { key: 'templateName', label: 'Template Name' },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => <StatusBadge status={val} />
    },
    { 
      key: 'action', 
      label: 'Action',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            className="upload-template__table-action-btn"
            onClick={() => handleGenerateTemplate(row)}
            disabled={isGenerating[row.id] || generatedForms[row.id]}
            title="Generate Template"
          >
            {isGenerating[row.id] ? 'Generating...' : '✨ Generate'}
          </button>
          <button 
            className="upload-template__table-action-btn"
            style={{ 
              backgroundColor: (row.status === 'GENERATED' || generatedForms[row.id]) ? '#e8f5e9' : '#f5f5f5', 
              color: (row.status === 'GENERATED' || generatedForms[row.id]) ? '#2e7d32' : '#9e9e9e', 
              borderColor: (row.status === 'GENERATED' || generatedForms[row.id]) ? '#c8e6c9' : '#e0e0e0',
              cursor: (row.status === 'GENERATED' || generatedForms[row.id]) ? 'pointer' : 'not-allowed'
            }}
            title="Download Template"
            onClick={() => handleDownloadTemplate(row)}
            disabled={!(row.status === 'GENERATED' || generatedForms[row.id])}
          >
            <FiDownload size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="upload-template">
      <div className="upload-template__container">
        
        {/* Header */}
        <div className="upload-template__header">
          <h1 className="upload-template__title">Form Filling AI Tool</h1>
        </div>

        {/* Stepper */}
        <Stepper steps={STEPS} currentStep={4} />

        {/* Top Form Fields */}
        <div className="upload-template__top-grid">
          <FormField
            label="Company Name"
            required
            type="select"
            options={dynamicCompanyOptions}
            value={formData.companyId}
            onChange={updateField('companyId')}
            disabled={true}
          />
          <FormField
            label="CIN"
            required
            value={formData.cin}
            onChange={updateField('cin')}
            disabled={true}
          />
          <FormField
            label="Financial Year"
            required
            type="select"
            options={financialYearOptions}
            value={formData.financialYear}
            onChange={updateField('financialYear')}
            disabled={true}
          />
          <FormField
            label="Team Name"
            required
            type="select"
            options={dynamicTeamOptions}
            value={formData.teamId}
            onChange={updateField('teamId')}
            disabled={true}
          />
          <FormField
            label="Select Form"
            required
            type="select"
            options={dynamicFormOptions}
            value={formData.formTypeMasterId}
            onChange={updateField('formTypeMasterId')}
            disabled={true}
          />

        </div>



        {/* File Upload Section */}
        <div className="upload-template__middle">
          
          <div className="upload-template__left-card">
            <h3 className="upload-template__card-title">Upload Documents Required</h3>
            <ul className="upload-template__doc-list">
              {sourceSuggestions.map(s => (
                <li key={`source-${s.id}`}>{s.name} (Source)</li>
              ))}
              {templateSuggestions.map(t => (
                <li key={`template-${t.id}`}>{t.name} (Blank Template)</li>
              ))}
              {sourceSuggestions.length === 0 && templateSuggestions.length === 0 && (
                <li>No documents required</li>
              )}
            </ul>
          </div>

          <div className="upload-template__right-card">
            <div className="upload-template__upload-zones">
              
              {/* Source Document Zone */}
              <div className="upload-template__zone-wrapper">
                <h4 className="upload-template__zone-title">Upload Source Document</h4>
                <div 
                  className="upload-template__dropzone"
                  onClick={() => document.getElementById('source-upload-input').click()}
                  onDragOver={handleDragOver}
                  onDrop={handleSourceDrop}
                  style={{ cursor: 'pointer' }}
                >
                  <p>Drop files here</p>
                  <FiUpload size={24} className="upload-template__drop-icon" />
                  <span className="upload-template__browse-link">or Browse</span>
                  <input 
                    type="file" 
                    id="source-upload-input" 
                    multiple 
                    style={{ display: 'none' }} 
                    onChange={handleSourceUpload} 
                  />
                </div>
                <div className="upload-template__file-list">
                  {sourceFiles.map(file => (
                    <div key={file.id} className="upload-template__file-item">
                      <span className={`upload-template__file-icon icon-${file.type}`}>📄</span>
                      <span className="upload-template__file-name">{file.name}</span>
                      <button className="upload-template__delete-btn" onClick={(e) => { e.stopPropagation(); removeSourceFile(file.id); }}>
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Template Form Zone */}
              <div className="upload-template__zone-wrapper">
                <h4 className="upload-template__zone-title">Upload Template Form</h4>
                <div 
                  className="upload-template__dropzone"
                  onClick={() => document.getElementById('template-upload-input').click()}
                  onDragOver={handleDragOver}
                  onDrop={handleTemplateDrop}
                  style={{ cursor: 'pointer' }}
                >
                  <p>Drop files here</p>
                  <FiUpload size={24} className="upload-template__drop-icon" />
                  <span className="upload-template__browse-link">or Browse</span>
                  <input 
                    type="file" 
                    id="template-upload-input" 
                    multiple 
                    style={{ display: 'none' }} 
                    onChange={handleTemplateUpload} 
                  />
                </div>
                <div className="upload-template__file-list">
                  {templateFiles.map(file => (
                    <div key={file.id} className="upload-template__file-item">
                      <span className={`upload-template__file-icon icon-${file.type}`}>📄</span>
                      <span className="upload-template__file-name">{file.name}</span>
                      <button className="upload-template__delete-btn" onClick={(e) => { e.stopPropagation(); removeTemplateFile(file.id); }}>
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
            
            <div className="upload-template__add-action">
              <button className="upload-template__add-btn" onClick={handleSubmitAdd}>Add</button>
            </div>
          </div>
        </div>

        {/* Data Table Section */}
        <div className="upload-template__bottom">
          <div className="upload-template__table-card">
            <div className="upload-template__table-header">
              <h3 className="upload-template__table-title">List of Forms</h3>
            </div>
            <div className="upload-template__table-body">
              <button className="upload-template__generate-bulk-btn">
                ✨ Generate
              </button>
              <DataTable 
                columns={columns}
                data={formsData}
                selectable={true}
                pagination={false}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default UploadTemplate;
