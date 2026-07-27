import React from 'react'
import { Heart, Droplets, Zap, Thermometer } from 'lucide-react'
import './VitalsCards.css'

function VitalsCards({ vitals }) {
  const getHeartRateStatus = (hr) => {
    if (hr < 60) return 'Low';
    if (hr > 100) return 'High';
    return 'Normal';
  }

  const getHeartRateColor = (hr) => {
    if (hr < 60) return '#3b82f6';
    if (hr > 100) return '#ef4444';
    return '#10b981';
  }

  const getSpO2Color = (spo2) => {
    if (spo2 < 95) return '#ef4444';
    if (spo2 < 98) return '#f59e0b';
    return '#10b981';
  }

  return (
    <div className="vitals-grid">
      <div className="vital-card">
        <div className="vital-header">
          <Heart size={24} style={{ color: getHeartRateColor(vitals.heartRate) }} />
          <span className="vital-label">Heart Rate</span>
        </div>
        <div className="vital-value" style={{ color: getHeartRateColor(vitals.heartRate) }}>
          {Math.round(vitals.heartRate)}
        </div>
        <div className="vital-unit">bpm</div>
        <div className="vital-status" style={{ color: getHeartRateColor(vitals.heartRate) }}>
          {getHeartRateStatus(vitals.heartRate)}
        </div>
      </div>

      <div className="vital-card">
        <div className="vital-header">
          <Droplets size={24} style={{ color: getSpO2Color(vitals.spO2) }} />
          <span className="vital-label">SpO2</span>
        </div>
        <div className="vital-value" style={{ color: getSpO2Color(vitals.spO2) }}>
          {vitals.spO2.toFixed(1)}
        </div>
        <div className="vital-unit">%</div>
        <div className="vital-status" style={{ color: getSpO2Color(vitals.spO2) }}>
          {vitals.spO2 < 95 ? 'Critical' : vitals.spO2 < 98 ? 'Warning' : 'Normal'}
        </div>
      </div>

      <div className="vital-card">
        <div className="vital-header">
          <Zap size={24} style={{ color: '#06b6d4' }} />
          <span className="vital-label">ECG Status</span>
        </div>
        <div className="vital-value" style={{ color: '#06b6d4', fontSize: '18px' }}>
          {vitals.ecgStatus}
        </div>
        <div className="vital-unit">—</div>
        <div className="vital-status" style={{ color: '#10b981' }}>
          Monitoring
        </div>
      </div>

      <div className="vital-card">
        <div className="vital-header">
          <Thermometer size={24} style={{ color: '#f59e0b' }} />
          <span className="vital-label">Temperature</span>
        </div>
        <div className="vital-value" style={{ color: '#f59e0b' }}>
          {vitals.temperature.toFixed(1)}
        </div>
        <div className="vital-unit">°F</div>
        <div className="vital-status" style={{ color: vitals.temperature > 99 ? '#ef4444' : '#10b981' }}>
          {vitals.temperature > 99 ? 'Elevated' : 'Normal'}
        </div>
      </div>
    </div>
  )
}

export default VitalsCards
