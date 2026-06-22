import './StatusBadge.css'

function StatusBadge({ status }) {
  const getVariant = () => {
    switch (status?.toLowerCase()) {
      case 'done':
        return 'success'
      case 'in progress':
      case 'pending':
        return 'warning'
      case 'error':
      case 'failed':
        return 'danger'
      default:
        return 'info'
    }
  }

  return (
    <span className={`status-badge status-badge--${getVariant()}`}>
      {status}
    </span>
  )
}

export default StatusBadge
