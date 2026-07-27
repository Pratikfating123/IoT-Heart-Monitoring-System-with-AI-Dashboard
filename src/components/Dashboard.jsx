import React, { useState } from 'react'
import VitalsCards from './VitalsCards'
import ChartSection from './ChartSection'
import HistoryTable from './HistoryTable'
import { exportToPDF } from '../utils/pdfExport'
import { Download } from 'lucide-react'
import './Dashboard.css'

function Dashboard({ currentVitals, vitalsData }) {
  const [filterText, setFilterText] = useState('')
  const [selectedTab, setSelectedTab] = useState('overview')

  const filteredData = vitalsData.filter(item =>
    item.timestamp.toLowerCase().includes(filterText.toLowerCase())
  )

  const handleExportPDF = async () => {
    await exportToPDF(currentVitals, vitalsData)
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>IoT Heart Monitor Dashboard</h1>
          <p className="subtitle">Real-time Vital Monitoring & AI Insights</p>
        </div>
        <button className="export-btn" onClick={handleExportPDF}>
          <Download size={18} />
          Export PDF
        </button>
      </div>

      <VitalsCards vitals={currentVitals} />

      <div className="dashboard-content">
        <div className="tabs">
          <button
            className={`tab ${selectedTab === 'overview' ? 'active' : ''}`}
            onClick={() => setSelectedTab('overview')}
          >
            Real-Time Monitoring
          </button>
          <button
            className={`tab ${selectedTab === 'history' ? 'active' : ''}`}
            onClick={() => setSelectedTab('history')}
          >
            History
          </button>
        </div>

        {selectedTab === 'overview' && (
          <ChartSection vitalsData={vitalsData} />
        )}

        {selectedTab === 'history' && (
          <div className="history-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by timestamp..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>
            <HistoryTable data={filteredData} />
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
