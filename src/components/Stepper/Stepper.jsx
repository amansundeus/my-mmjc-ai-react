import './Stepper.css'

function Stepper({ steps, currentStep }) {
  return (
    <div className="stepper">
      {steps.map((step, index) => {
        const stepNum = index + 1
        const isActive = stepNum === currentStep
        const isCompleted = stepNum < currentStep

        return (
          <div key={stepNum} className="stepper__item">
            <div className="stepper__step-wrapper">
              {index > 0 && (
                <div
                  className={`stepper__line stepper__line--left ${
                    isCompleted || isActive ? 'stepper__line--active' : ''
                  }`}
                />
              )}
              <div
                className={`stepper__circle ${
                  isActive ? 'stepper__circle--active' : ''
                } ${isCompleted ? 'stepper__circle--completed' : ''}`}
              >
                {stepNum}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`stepper__line stepper__line--right ${
                    isCompleted ? 'stepper__line--active' : ''
                  }`}
                />
              )}
            </div>
            <div
              className={`stepper__label ${
                isActive ? 'stepper__label--active' : ''
              } ${isCompleted ? 'stepper__label--completed' : ''}`}
            >
              {step}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Stepper
