import { useNavigate, useParams } from 'react-router-dom'
import { FiArrowLeft, FiSave, FiArrowRight } from 'react-icons/fi'
import Stepper from '../../components/Stepper/Stepper'
import DynamicSection from '../../components/FormEngine/DynamicSection'
import { useFormEngine } from '../../hooks/useFormEngine'
import './FillForm.css'

const STEPS = ['Create IRL', 'View IRL', 'Fill Form', 'Upload Template']

function FillForm() {
  const navigate = useNavigate()
  const { formTypeId = '2', formId = '1' } = useParams()

  const {
    sections,
    values,
    aiFilledFields,
    loading,
    percentComplete,
    updateValue,
    applyAiSuggestions,
    isFieldVisible,
    isFieldDisabled,
    saveForm
  } = useFormEngine(formId, formTypeId)

  const handleBack = () => {
    navigate('/create-irl')
  }

  const handleSave = async () => {
    const success = await saveForm();
    if (success) {
      navigate('/create-irl', { state: { returnToStep: 2 } });
    }
  }

  const handleNext = () => {
    // Save first, then navigate
    saveForm().then(() => {
      navigate('/upload-template') // assuming next route
    })
  }

  return (
    <div className="fill-form">
      <div className="fill-form__container">
        {/* Header */}
        <div className="fill-form__header">
          <button className="fill-form__back-btn" onClick={handleBack} id="fill-form-back-btn">
            <FiArrowLeft size={18} />
          </button>
          <h1 className="fill-form__title">IRL AOC 4 (ABC LTD)</h1>
          <div className="fill-form__header-actions">
            <button
              className="fill-form__ai-btn"
              onClick={applyAiSuggestions}
              disabled={loading}
              title="Auto-fill form using AI"
            >
              ✨ Auto-fill with AI
            </button>
          </div>
        </div>

        {/* Stepper */}
        <Stepper steps={STEPS} currentStep={3} />

        {/* Progress Bar */}
        <div className="fill-form__progress">
          <div className="fill-form__progress-info">
            <span>Form Completion</span>
            <span>{percentComplete}%</span>
          </div>
          <div className="fill-form__progress-bar">
            <div
              className="fill-form__progress-fill"
              style={{ width: `${percentComplete}%` }}
            ></div>
          </div>
        </div>

        {/* Dynamic Form Engine */}
        <div className="fill-form__engine">
          {loading && sections.length === 0 ? (
            <div className="fill-form__loading">
              <div className="fill-form__loading-spinner"></div>
              <p>Loading form schema...</p>
            </div>
          ) : (
            sections.map(section => (
              <DynamicSection
                key={section.sectionId}
                section={section}
                values={values}
                onChange={updateValue}
                isFieldVisible={isFieldVisible}
                isFieldDisabled={isFieldDisabled}
                aiFilledFields={aiFilledFields}
              />
            ))
          )}
        </div>

        {/* Form Actions */}
        <div className="fill-form__actions">
          <button
            className="fill-form__save-btn"
            id="save-form-btn"
            onClick={handleSave}
            disabled={loading}
          >
            <FiSave size={14} />
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button
            className="fill-form__next-btn"
            id="fill-form-next-btn"
            onClick={handleNext}
            disabled={loading}
          >
            Next
            <FiArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default FillForm
