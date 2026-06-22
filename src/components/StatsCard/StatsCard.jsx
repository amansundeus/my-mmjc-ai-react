import './StatsCard.css'

function StatsCard({ icon, count, label, bgColor, iconColor }) {
  return (
    <div className="stats-card" style={{ '--card-bg': bgColor }}>
      <div className="stats-card__icon" style={{ '--icon-color': iconColor }}>
        {icon}
      </div>
      <div className="stats-card__count">{count}</div>
      <div className="stats-card__label">{label}</div>
    </div>
  )
}

export default StatsCard
