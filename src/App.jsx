import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard/Dashboard'
import CreateIRL from './pages/CreateIRL/CreateIRL'
import FillForm from './pages/FillForm/FillForm'
import UploadTemplate from './pages/UploadTemplate/UploadTemplate'
import AttributeManagement from './pages/AttributeManagement/AttributeManagement'
import Login from './pages/Login/Login'
import './App.css'

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/create-irl" element={<CreateIRL />} />
        <Route path="/fill-form" element={<FillForm />} />
        {/* Old route for backwards compatibility */}
        <Route path="/fill-form/:formTypeId/:templateId/:sourceId/:formId" element={<FillForm />} />
        {/* New simplified route */}
        <Route path="/fill-form/:formTypeId/:formId" element={<FillForm />} />
        <Route path="/upload-template" element={<UploadTemplate />} />
        <Route path="/attribute-management" element={<AttributeManagement />} />
      </Routes>
    </div>
  )
}

export default App
