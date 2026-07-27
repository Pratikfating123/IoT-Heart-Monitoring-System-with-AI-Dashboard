import React from 'react'
import './HistoryTable.css'

function HistoryTable({ data }) {
  return (
    <div className="table-wrapper">
      <table className="history-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Heart Rate (bpm)</th>
            <th>SpO2 (%)</th>
            <th>Temperature (°F)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => {
              const getStatus = () => {
                if (item.heartRate > 100 || item.spO2 < 95) return 'Warning'
                return 'Normal'
              }

              const statusColor = getStatus() === 'Normal' ? '#10b981' : '#ef4444'

              return (
                <tr key={index}>
                  <td>{item.timestamp}</td>
                  <td>
                    <span className="value-cell">{Math.round(item.heartRate)}</span>
                  </td>
                  <td>
                    <span className="value-cell">{item.spO2.toFixed(1)}</span>
                  </td>
                  <td>
                    <span className="value-cell">{item.temperature.toFixed(1)}</span>
                  </td>
                  <td>
                    <span className="status-badge" style={{ borderColor: statusColor }}>
                      {getStatus()}
                    </span>
                  </td>
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8' }}>
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default HistoryTable
