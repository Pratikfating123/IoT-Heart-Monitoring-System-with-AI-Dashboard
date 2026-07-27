import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './ChartSection.css'

function ChartSection({ vitalsData }) {
  // Prepare data for charts
  const chartData = vitalsData.slice(-20).map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    heartRate: item.heartRate,
    spO2: item.spO2,
    temperature: item.temperature * 10 // Scale for visibility
  }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-time">{payload[0].payload.time}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(1)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="chart-section">
      <div className="chart-container">
        <h3>Heart Rate Trend (Last 20 readings)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3f5f" />
            <XAxis dataKey="time" stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="heartRate"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3>SpO2 & Temperature Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3f5f" />
            <XAxis dataKey="time" stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="spO2"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="stats-grid">
        <div className="stat-box">
          <h4>Average Heart Rate</h4>
          <p className="stat-value">
            {vitalsData.length > 0
              ? (vitalsData.reduce((sum, v) => sum + v.heartRate, 0) / vitalsData.length).toFixed(0)
              : '—'}
          </p>
          <span className="stat-unit">bpm</span>
        </div>

        <div className="stat-box">
          <h4>Average SpO2</h4>
          <p className="stat-value">
            {vitalsData.length > 0
              ? (vitalsData.reduce((sum, v) => sum + v.spO2, 0) / vitalsData.length).toFixed(1)
              : '—'}
          </p>
          <span className="stat-unit">%</span>
        </div>

        <div className="stat-box">
          <h4>Max Heart Rate</h4>
          <p className="stat-value">
            {vitalsData.length > 0
              ? Math.max(...vitalsData.map(v => v.heartRate)).toFixed(0)
              : '—'}
          </p>
          <span className="stat-unit">bpm</span>
        </div>

        <div className="stat-box">
          <h4>Min Heart Rate</h4>
          <p className="stat-value">
            {vitalsData.length > 0
              ? Math.min(...vitalsData.map(v => v.heartRate)).toFixed(0)
              : '—'}
          </p>
          <span className="stat-unit">bpm</span>
        </div>
      </div>
    </div>
  )
}

export default ChartSection
