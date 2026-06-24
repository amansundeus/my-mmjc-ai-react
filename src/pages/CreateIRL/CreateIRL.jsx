import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { FiPlus, FiRefreshCw, FiArrowRight, FiArrowLeft } from 'react-icons/fi'
import Stepper from '../../components/Stepper/Stepper'
import SectionCard from '../../components/SectionCard/SectionCard'
import FormField from '../../components/FormField/FormField'
import DataTable from '../../components/DataTable/DataTable'
import ActionButtons from '../../components/ActionButtons/ActionButtons'
import { getIrlFormsList, createIrlForm, updateIrlForm, archiveIrlForm, getIrlFormById, getCompaniesDropdown, getTeams, getFormTypeMasters, getTemplateMasters, uploadIrlDocument } from '../../services/api'
import './CreateIRL.css'

const STEPS = ['Create IRL', 'View IRL', 'Fill Form', 'Upload Template']

function CreateIRL() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const formTypeMasterId = searchParams.get('formTypeMasterId') || ''

  const [currentStep, setCurrentStep] = useState(location.state?.returnToStep || 1)
  const [formData, setFormData] = useState({
    companyName: '',
    companyId: '',
    cin: '',
    financialYear: '',
    teamName: '',
    teamId: '',
    selectForm: '',
    formTypeMasterId: '',
    templateName: '',
    templateMasterId: '',
    standaloneFinancial: 'Balance sheet',
    sourceFiles: [],
    templateFiles: [],
  })

  const [irlList, setIrlList] = useState([])
  const [hasGenerated, setHasGenerated] = useState(false)
  const [editingFormId, setEditingFormId] = useState(null)
  
  const [dropdownCompanies, setDropdownCompanies] = useState([])
  const [dropdownTeams, setDropdownTeams] = useState([])
  const [dropdownFormTypes, setDropdownFormTypes] = useState([])
  const [dropdownTemplates, setDropdownTemplates] = useState([])

  const fetchList = useCallback(async () => {
    try {
      const response = await getIrlFormsList(formTypeMasterId)
      if (response?.body) {
        const rawData = response?.body?.data || response?.body?.content || (Array.isArray(response.body) ? response.body : [])
        const mappedList = rawData.map(item => ({
           ...item,
           irlName: item.irlName || item.formTypeMasterName || item.name || 'IRL Form',
           companyName: item.companyName || '-',
           cin: item.cin || '-',
           financialYear: item.financialYear || '-',
           teamName: item.teamName || '-',
           percentComplete: item.percentComplete !== undefined && item.percentComplete !== null ? `${item.percentComplete}%` : '0%',
           formId: item.formId || item.id || '1'
        }))
        setIrlList(mappedList)
      }
    } catch (err) {
      console.error('Failed to fetch IRL list:', err)
    }
  }, [formTypeMasterId])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [compRes, teamRes, formRes] = await Promise.all([
          getCompaniesDropdown().catch(() => ({ body: [] })),
          getTeams().catch(() => ({ body: { content: [] } })),
          getFormTypeMasters().catch(() => ({ body: [] }))
        ])
        
        setDropdownCompanies(compRes?.body || [])
        setDropdownTeams(teamRes?.body?.content || teamRes?.body?.data || [])
        setDropdownFormTypes(formRes?.body || [])
      } catch (err) {
        console.error('Failed to fetch dropdowns:', err)
      }
    }
    fetchDropdowns()
  }, [])

  useEffect(() => {
    const fetchTemplates = async () => {
      if (!formData.formTypeMasterId) {
        setDropdownTemplates([])
        return
      }
      try {
        const res = await getTemplateMasters(formData.formTypeMasterId)
        setDropdownTemplates(res?.body || [])
      } catch (err) {
        console.error('Failed to fetch templates:', err)
      }
    }
    fetchTemplates()
  }, [formData.formTypeMasterId])

  const updateField = (field) => (e) => {
    const value = e.target.value
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (field === 'companyId') {
      const selected = dropdownCompanies.find(c => (c.companyId || c.id)?.toString() === value?.toString())
      if (selected) {
        setFormData(prev => ({ ...prev, companyId: selected.companyId || selected.id, companyName: selected.companyName || selected.name, cin: selected.cin || '' }))
      }
    } else if (field === 'teamId') {
      const selected = dropdownTeams.find(t => (t.teamId || t.id)?.toString() === value?.toString())
      if (selected) {
        setFormData(prev => ({ ...prev, teamId: selected.teamId || selected.id, teamName: selected.teamName || selected.name }))
      }
    } else if (field === 'formTypeMasterId') {
      const selected = dropdownFormTypes.find(f => (f.formTypeMasterId || f.id)?.toString() === value?.toString())
      if (selected) {
        setFormData(prev => ({ ...prev, formTypeMasterId: selected.formTypeMasterId || selected.id, selectForm: selected.formTypeMasterName || selected.name }))
      }
    } else if (field === 'templateMasterId') {
      const selected = dropdownTemplates.find(t => (t.templateMasterId || t.id)?.toString() === value?.toString())
      if (selected) {
        setFormData(prev => ({ ...prev, templateMasterId: selected.templateMasterId || selected.id, templateName: selected.templateName || selected.name }))
      }
    }
  }

  const handleSourceUpload = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setFormData(prev => ({ ...prev, sourceFiles: files }))
    }
  }

  const handleTemplateUpload = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setFormData(prev => ({ ...prev, templateFiles: files }))
    }
  }

  const dynamicCompanyOptions = dropdownCompanies.map(c => ({ label: c.companyName || c.name, value: c.companyId || c.id }))
  const dynamicTeamOptions = dropdownTeams.map(t => ({ label: t.teamName || t.name, value: t.teamId || t.id }))
  const dynamicFormOptions = dropdownFormTypes.map(f => ({ label: f.formTypeMasterName || f.name, value: f.formTypeMasterId || f.id }))
  const dynamicTemplateOptions = dropdownTemplates.map(t => ({ label: t.templateName || t.name, value: t.templateMasterId || t.id }))
  
  const financialYearOptions = [
    { label: 'FY23-24', value: 'FY23-24' },
    { label: 'FY24-25', value: 'FY24-25' },
    { label: 'FY25-26', value: 'FY25-26' },
    { label: 'FY26-27', value: 'FY26-27' },
  ]

  const handleGenerate = async () => {
    if (!formData.companyName || !formData.selectForm) return

    const payload = {
      irlName: formData.selectForm || 'IRL Form',
      companyId: formData.companyId ? parseInt(formData.companyId, 10) : 0,
      companyName: formData.companyName || '-',
      cin: formData.cin || '12345678',
      financialYear: formData.financialYear || '2025-26',
      teamId: formData.teamId ? parseInt(formData.teamId, 10) : 0,
      teamName: formData.teamName || '-',
      formTypeMasterId: formData.formTypeMasterId ? parseInt(formData.formTypeMasterId, 10) : parseInt(formTypeMasterId, 10) || 1,
      formTypeMasterName: formData.selectForm || 'AOC 4',
      templateMasterId: formData.templateMasterId ? parseInt(formData.templateMasterId, 10) : 1,
      templateName: formData.templateName || 'Balance sheet',
      documents: [],
      formStatus: 'PENDING',
      percentComplete: 0,
      uploadStatus: null
    }

    try {
      let savedForm;
      if (editingFormId) {
        const res = await updateIrlForm(editingFormId, payload);
        savedForm = res.body || res;
      } else {
        const res = await createIrlForm(payload);
        savedForm = res.body || res;
        setEditingFormId(savedForm?.formId || savedForm?.id);
      }
      
      const targetFormId = savedForm?.formId || savedForm?.id;
      if (targetFormId) {
        if (formData.sourceFiles?.length > 0) {
          for (const file of formData.sourceFiles) {
            try {
              await uploadIrlDocument(targetFormId, file, 'SOURCE');
            } catch (uploadErr) {
              console.error(`Failed to upload source file ${file.name}`, uploadErr);
            }
          }
        }
        if (formData.templateFiles?.length > 0) {
          for (const file of formData.templateFiles) {
            try {
              await uploadIrlDocument(targetFormId, file, 'TEMPLATE');
            } catch (uploadErr) {
              console.error(`Failed to upload template file ${file.name}`, uploadErr);
            }
          }
        }
      }

      await fetchList();
      setHasGenerated(true);
    } catch (err) {
      console.error("Failed to save IRL Form", err);
      alert('Failed to save IRL Form');
    }
  }

  const handleNext = () => {
    if (currentStep < 4) {
      if (currentStep === 2) {
        navigate('/fill-form')
      } else {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handleBack = () => {
    if (currentStep === 1) {
      navigate('/')
    } else {
      setCurrentStep(currentStep - 1)
    }
  }

  const irlColumns = [
    { key: 'irlName', label: 'IRL Name' },
    { key: 'companyName', label: 'Company Name' },
    { key: 'cin', label: 'CIN' },
    { key: 'financialYear', label: 'Financial Year' },
    { key: 'teamName', label: 'Team Name' },
    { key: 'percentComplete', label: '% Complete' },
    {
      key: 'action',
      label: 'Action',
      render: (_, row) => (
        <ActionButtons
          actions={['save', 'edit', 'archive']}
          disabledActions={parseInt(row.percentComplete, 10) !== 100 ? ['save'] : []}
          onAction={async (action) => {
            if (action === 'edit') {
              const typeId = row.formTypeMasterId || formTypeMasterId || 200;
              const fId = row.formId || row.id || 1;
              navigate(`/fill-form/${typeId}/${fId}`);
            } else if (action === 'save') {
              navigate('/upload-template', { state: { selectedIrl: row } });
            } else if (action === 'archive') {
              if (window.confirm("Are you sure you want to archive this IRL Form?")) {
                try {
                  const fId = row.formId || row.id;
                  await archiveIrlForm(fId);
                  await fetchList();
                  // alert("Form archived successfully!");
                } catch (err) {
                  console.error("Failed to archive form", err);
                  alert("Failed to archive the form.");
                }
              }
            }
          }}
        />
      ),
    },
  ]

  const emptyIrlData = [
    {
      irlName: '-',
      companyName: '-',
      cin: '-',
      financialYear: '-',
      teamName: '-',
      percentComplete: '-',
    },
  ]

  return (
    <div className="create-irl">
      <div className="create-irl__container">
        {/* Header */}
        <div className="create-irl__header">
          <button className="create-irl__back-btn" onClick={handleBack} id="back-btn">
            <FiArrowLeft size={18} />
          </button>
          <h1 className="create-irl__title">
            {currentStep === 1 ? 'IRL AOC 4' : 'Create IRL AOC 4'}
          </h1>
        </div>

        {/* Stepper */}
        <Stepper steps={STEPS} currentStep={currentStep} />

        {/* Step 1: Initial - Create IRL button */}
        {currentStep === 1 && !hasGenerated && (
          <div className="create-irl__initial animate-fadeIn">
            <button
              className="create-irl__create-btn"
              onClick={() => setCurrentStep(2)}
              id="create-irl-btn"
            >
              <FiPlus size={16} />
              Create IRL
            </button>
          </div>
        )}

        {/* Step 2: Form + List */}
        {(currentStep === 2 || (currentStep === 1 && hasGenerated)) && (
          <>
            {/* IRL Form */}
            <SectionCard title="IRL AOC 4" variant="blue" className="animate-fadeIn">
              <div className="create-irl__form-grid">
                <FormField
                  label="Company name"
                  required
                  type="select"
                  placeholder="Select company"
                  options={dynamicCompanyOptions}
                  value={formData.companyId}
                  onChange={updateField('companyId')}
                  id="company-name"
                />
                <FormField
                  label="CIN"
                  required
                  placeholder="Enter CIN"
                  value={formData.cin}
                  onChange={updateField('cin')}
                  id="cin"
                />
                <FormField
                  label="Financial year"
                  required
                  type="select"
                  placeholder="Select FY"
                  options={financialYearOptions}
                  value={formData.financialYear}
                  onChange={updateField('financialYear')}
                  id="financial-year"
                />
                <FormField
                  label="Team name"
                  required
                  type="select"
                  placeholder="Select team"
                  options={dynamicTeamOptions}
                  value={formData.teamId}
                  onChange={updateField('teamId')}
                  id="team-name"
                />
                <FormField
                  label="Select form"
                  required
                  type="select"
                  placeholder="Select form"
                  options={dynamicFormOptions}
                  value={formData.formTypeMasterId}
                  onChange={updateField('formTypeMasterId')}
                  id="select-form"
                />

              </div>
              <div className="create-irl__upload-section" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div className="create-irl__upload-column" style={{ flex: 1 }}>
                  <div className="create-irl__upload-row">
                    <FormField
                      label="Upload Source Document"
                      type="file"
                      multiple={true}
                      value={formData.sourceFiles?.length ? `${formData.sourceFiles.length} file(s) selected` : ''}
                      onChange={handleSourceUpload}
                      id="upload-source"
                    />
                  </div>
                  {formData.sourceFiles && formData.sourceFiles.length > 0 && (
                    <div className="create-irl__uploaded-files" style={{ marginTop: '1rem' }}>
                      <h4 className="create-irl__uploaded-title" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Source Files:</h4>
                      <ul className="create-irl__file-list" style={{ listStyle: 'none', padding: 0, marginTop: '8px' }}>
                        {formData.sourceFiles.map((f, i) => (
                          <li key={i} className="create-irl__file-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                            <span className="create-irl__file-icon">📄</span>
                            {f.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="create-irl__upload-column" style={{ flex: 1 }}>
                  <div className="create-irl__upload-row">
                    <FormField
                      label="Upload Template"
                      type="file"
                      multiple={true}
                      value={formData.templateFiles?.length ? `${formData.templateFiles.length} file(s) selected` : ''}
                      onChange={handleTemplateUpload}
                      id="upload-template"
                    />
                  </div>
                  {formData.templateFiles && formData.templateFiles.length > 0 && (
                    <div className="create-irl__uploaded-files" style={{ marginTop: '1rem' }}>
                      <h4 className="create-irl__uploaded-title" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Template Files:</h4>
                      <ul className="create-irl__file-list" style={{ listStyle: 'none', padding: 0, marginTop: '8px' }}>
                        {formData.templateFiles.map((f, i) => (
                          <li key={i} className="create-irl__file-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                            <span className="create-irl__file-icon">📋</span>
                            {f.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* Actions */}
            <div className="create-irl__actions">
              <button
                className="create-irl__generate-btn"
                onClick={handleGenerate}
                id="generate-btn"
              >
                <FiRefreshCw size={14} />
                Generate
              </button>
              {hasGenerated && (
                <button
                  className="create-irl__next-btn"
                  onClick={handleNext}
                  id="next-btn"
                >
                  Next
                </button>
              )}
            </div>

            {/* IRL List */}
            <SectionCard title="List of IRL Forms" variant="blue" className="animate-slideIn">
              <DataTable
                columns={irlColumns}
                data={irlList.length > 0 ? irlList : emptyIrlData}
                pagination={true}
              />
            </SectionCard>
          </>
        )}
      </div>
    </div>
  )
}

export default CreateIRL
