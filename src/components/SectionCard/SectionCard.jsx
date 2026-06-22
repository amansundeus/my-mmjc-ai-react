import { useState } from 'react'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'
import './SectionCard.css'

function SectionCard({ title, children, variant = 'blue', className = '', collapsible = false, defaultCollapsed = false }) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  const toggleCollapse = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed)
    }
  }

  return (
    <div className={`section-card section-card--${variant} ${className}`}>
      {title && (
        <div 
          className={`section-card__header ${collapsible ? 'section-card__header--collapsible' : ''}`}
          onClick={toggleCollapse}
        >
          <h3 className="section-card__title">{title}</h3>
          {collapsible && (
            <button className="section-card__collapse-btn" type="button" aria-label="Toggle Section">
              {isCollapsed ? <FiChevronDown size={18} /> : <FiChevronUp size={18} />}
            </button>
          )}
        </div>
      )}
      {!isCollapsed && <div className="section-card__body">{children}</div>}
    </div>
  )
}

export default SectionCard
