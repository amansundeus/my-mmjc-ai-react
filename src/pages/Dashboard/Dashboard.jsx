import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiFileText,
  FiFile,
  FiGrid,
  FiClipboard,
  FiLayers,
  FiSearch,
  FiFilter,
  FiArchive,
  FiPlus,
  FiSettings,
} from 'react-icons/fi'
import StatsCard from '../../components/StatsCard/StatsCard'
import SectionCard from '../../components/SectionCard/SectionCard'
import DataTable from '../../components/DataTable/DataTable'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import ActionButtons from '../../components/ActionButtons/ActionButtons'
import { getForms } from '../../services/api'
import './Dashboard.css'

// STATS is now computed dynamically below

const TABS = ['AOC 4 Only', 'AOC 4 & AOC 4 CFS', 'MGT 7', 'MGT 7A']

function Dashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [formsList, setFormsList] = useState([])
  const [totalElements, setTotalElements] = useState(0)

  const stats = useMemo(() => {
    const aoc4Count = formsList.filter(f => f.formName && f.formName.replace(/-/g, ' ').toUpperCase() === 'AOC 4').length
    const aoc4CfsCount = formsList.filter(f => f.formName && f.formName.replace(/-/g, ' ').toUpperCase() === 'AOC 4 CFS').length
    const mgt7Count = formsList.filter(f => f.formName && f.formName.replace(/-/g, ' ').toUpperCase() === 'MGT 7').length
    const mgt7ACount = formsList.filter(f => f.formName && f.formName.replace(/-/g, ' ').toUpperCase() === 'MGT 7A').length

    return [
      { icon: <FiFileText size={18} />, count: totalElements || formsList.length, label: 'Total Forms', bg: '#eef4ff', iconBg: '#3b82f6' },
      { icon: <FiFile size={18} />, count: aoc4Count, label: 'AOC 4', bg: '#edfcf2', iconBg: '#10b981' },
      { icon: <FiGrid size={18} />, count: aoc4CfsCount, label: 'AOC 4 CFS', bg: '#fff4ed', iconBg: '#f97316' },
      { icon: <FiClipboard size={18} />, count: mgt7Count, label: 'MGT 7', bg: '#f5f0ff', iconBg: '#8b5cf6' },
      { icon: <FiLayers size={18} />, count: mgt7ACount, label: 'MGT 7A', bg: '#edfcfc', iconBg: '#14b8a6' },
    ]
  }, [formsList, totalElements])

  useEffect(() => {
    const fetchDashboardForms = async () => {
      try {
        const response = await getForms(0, 1000, {}) // Fetch a larger page size to get all forms for client-side stats
        const rawData = response?.body?.data || response?.body?.content || (Array.isArray(response?.body) ? response.body : [])
        
        if (response?.body?.totalElements !== undefined) {
          setTotalElements(response.body.totalElements)
        }
        if (rawData && rawData.length > 0) {
          const list = rawData.map(item => ({
             ...item,
             formName: item.formTypeMasterName || item.name || 'AOC 4',
             companyName: item.companyName || '-',
             cin: item.cin || '-',
             financialYear: item.financialYear || '-',
             templateNumber: item.templateMasterId || '1',
             teamName: item.teamName || '-',
             status: item.formStatus || 'Pending',
             formTypeMasterId: item.formTypeMasterId || 1
          }))
          setFormsList(list)
        }
      } catch (err) {
        console.error('Failed to fetch forms:', err)
      }
    }
    fetchDashboardForms()
  }, [])

  const filteredData = formsList.filter((row) => {
    const matchesSearch =
      !searchQuery ||
      row.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.cin.includes(searchQuery)

    const matchesTab = (() => {
      // Normalize form names (e.g., 'AOC-4' to 'AOC 4')
      const normalizedFormName = row.formName ? row.formName.replace(/-/g, ' ').toUpperCase() : ''
      switch (activeTab) {
        case 0:
          return normalizedFormName === 'AOC 4'
        case 1:
          return normalizedFormName === 'AOC 4' || normalizedFormName === 'AOC 4 CFS'
        case 2:
          return normalizedFormName === 'MGT 7'
        case 3:
          return normalizedFormName === 'MGT 7A'
        default:
          return true
      }
    })()

    return matchesSearch && matchesTab
  })

  const columns = [
    { key: 'formName', label: 'Form Name' },
    { key: 'companyName', label: 'Company Name' },
    { key: 'cin', label: 'CIN' },
    { key: 'financialYear', label: 'Financial Year' },
    {
      key: 'templateNumber',
      label: 'Template Number',
      render: (value) => (
        <div className="template-select-wrapper">
          <select className="template-select" defaultValue={value} id="template-number-select">
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span className="template-select-arrow">▾</span>
        </div>
      ),
    },
    { key: 'teamName', label: 'Team Name' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'forms',
      label: 'Forms',
      render: () => (
        <button className="forms-icon-btn" title="View PDF" id="view-pdf-btn">
          <FiFileText size={16} color="#ef4444" />
        </button>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (_, row) => (
        <ActionButtons
          actions={['edit', 'folder']}
          onAction={(action) => {
            if (action === 'edit') {
              navigate(`/create-irl?formTypeMasterId=${row.formTypeMasterId}`)
            }
          }}
        />
      ),
    },
  ]

  return (
    <div className="dashboard">
      <div className="dashboard__container">
        {/* Header / Greeting */}
        <div className="dashboard__header-row">
          <h1 className="dashboard__greeting">Hello Admin/Partner,</h1>
          <button 
            className="dashboard__settings-btn" 
            onClick={() => navigate('/attribute-management')}
            title="Attribute Management"
          >
            <FiSettings size={20} />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="dashboard__stats">
          {stats.map((stat, i) => (
            <StatsCard
              key={i}
              icon={stat.icon}
              count={stat.count}
              label={stat.label}
              bgColor={stat.bg}
              iconColor={stat.iconBg}
            />
          ))}
        </div>

        {/* Tabs & Fill Up Form */}
        <div className="dashboard__tabs-row">
          <div className="dashboard__tabs">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                className={`dashboard__tab ${activeTab === i ? 'dashboard__tab--active' : ''}`}
                onClick={() => setActiveTab(i)}
                id={`tab-${i}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button
            className="dashboard__fill-btn"
            onClick={() => navigate('/create-irl')}
            id="fill-up-form-btn"
          >
            <FiPlus size={16} />
            Fill Up Form
          </button>
        </div>

        {/* List of Forms */}
        <SectionCard title="List of Forms" variant="blue">
          {/* Search & Actions */}
          <div className="dashboard__toolbar">
            <div className="dashboard__search-wrapper">
              <input
                className="dashboard__search"
                type="text"
                placeholder="Search Company"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="search-company-input"
              />
              <button className="dashboard__search-btn" id="search-btn">
                <FiSearch size={15} />
              </button>
            </div>
            <button className="dashboard__filter-btn" id="filter-btn">
              <FiFilter size={14} />
              Filter
            </button>
            <button className="dashboard__archive-btn" id="move-to-archive-btn">
              <FiArchive size={14} />
              Move to Archive
            </button>
          </div>

          <DataTable columns={columns} data={filteredData} />
        </SectionCard>
      </div>
    </div>
  )
}

export default Dashboard
