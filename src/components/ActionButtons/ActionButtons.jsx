import { FiFileText, FiEdit2, FiFolderPlus, FiSave, FiTrash2, FiCopy, FiArchive } from 'react-icons/fi'
import './ActionButtons.css'

function ActionButtons({ actions = ['view', 'edit', 'folder'], disabledActions = [], onAction }) {
  const iconMap = {
    view: { icon: <FiFileText size={15} />, color: '#ef4444', title: 'View PDF' },
    edit: { icon: <FiEdit2 size={15} />, color: '#f59e0b', title: 'Edit' },
    folder: { icon: <FiFolderPlus size={15} />, color: '#f59e0b', title: 'Open Folder' },
    save: { icon: <FiFileText size={15} />, color: '#10b981', title: 'Upload Form' },
    delete: { icon: <FiTrash2 size={15} />, color: '#ef4444', title: 'Delete' },
    copy: { icon: <FiCopy size={15} />, color: '#3b82f6', title: 'Copy' },
    archive: { icon: <FiArchive size={15} />, color: '#ef4444', title: 'Archive' },
  }

  return (
    <div className="action-buttons">
      {actions.map((action) => {
        const config = iconMap[action]
        if (!config) return null
        const isDisabled = disabledActions.includes(action)
        return (
          <button
            key={action}
            className={`action-btn ${isDisabled ? 'disabled' : ''}`}
            style={{ '--action-color': config.color }}
            title={config.title}
            onClick={() => !isDisabled && onAction?.(action)}
            disabled={isDisabled}
            id={`action-${action}`}
          >
            {config.icon}
          </button>
        )
      })}
    </div>
  )
}

export default ActionButtons
