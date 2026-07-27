import { useState, useEffect, useRef } from 'react'
import Dashboard from './components/Dashboard'
import AIChatbot from './components/AIChatbot'
import { generateMockData } from './utils/mockData'
import { fetchLatestTelemetry, fetchHistoricalTelemetry, createTelemetrySubscription } from './utils/thingboardApi'
import './App.css'

function App() {
  const [currentVitals, setCurrentVitals] = useState({
    heartRate: 75,
    spO2: 98,
    temperature: 98.6,
    ecgStatus: 'Normal',
    timestamp: new Date()
  })
  const [vitalsData, setVitalsData] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef(null)
  const useRealTime = true // Set to false to use simulated data

  // Fetch initial telemetry data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const data = await fetchLatestTelemetry()
        if (data) {
          setCurrentVitals({
            ...data,
            timestamp: new Date()
          })
          setIsConnected(true)
        }
      } catch (error) {
        console.error('Failed to fetch initial telemetry:', error)
      }
    }

    const fetchHistory = async () => {
      try {
        const history = await fetchHistoricalTelemetry()
        if (history && history.length > 0) {
          setVitalsData(history.map(item => ({
            timestamp: new Date(item.timestamp).toLocaleString(),
            heartRate: item.heartRate,
            spO2: item.spO2,
            temperature: item.temperature,
            ecgStatus: item.ecgStatus
          })))
        }
      } catch (error) {
        console.error('Failed to fetch historical telemetry:', error)
      }
    }

    let isMounted = true

    fetchInitialData()
    fetchHistory()

    // Set up WebSocket for real-time updates
    wsRef.current = createTelemetrySubscription((telemetry) => {
      if (isMounted) {
        setCurrentVitals(() => ({
          ...telemetry,
          timestamp: new Date()
        }))
        
        // Add to historical data
        setVitalsData(prev => {
          const newData = [...prev, {
            timestamp: new Date().toLocaleString(),
            heartRate: telemetry.heartRate,
            spO2: telemetry.spO2,
            temperature: telemetry.temperature,
            ecgStatus: telemetry.ecgStatus
          }]
          // Keep only last 100 readings
          return newData.slice(-100)
        })
      }
    })

    // Fallback: Poll for latest data every 2 seconds if WebSocket fails
    const pollInterval = setInterval(async () => {
      try {
        const latestData = await fetchLatestTelemetry()
        if (isMounted && latestData) {
          setCurrentVitals(() => ({
            ...latestData,
            timestamp: new Date()
          }))
          setIsConnected(true)
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 2000)

    return () => {
      isMounted = false
      if (wsRef.current) {
        wsRef.current.close()
      }
      clearInterval(pollInterval)
    }
  }, [useRealTime])

  // Simulate real-time data updates (fallback mode)
  useEffect(() => {
    if (useRealTime && isConnected) return

    const interval = setInterval(() => {
      setCurrentVitals(prev => ({
        ...prev,
        heartRate: Math.max(60, Math.min(120, prev.heartRate + (Math.random() - 0.5) * 10)),
        spO2: Math.max(95, Math.min(100, prev.spO2 + (Math.random() - 0.5) * 2)),
        temperature: Math.max(98, Math.min(99.5, prev.temperature + (Math.random() - 0.5) * 0.5)),
        timestamp: new Date()
      }))
    }, 3000)
 
    return () => clearInterval(interval)
  }, [useRealTime, isConnected])

  // Generate mock historical data on mount (fallback)
  useEffect(() => {
    if (!useRealTime) {
      setVitalsData(generateMockData())
    }
  }, [useRealTime])

  return (
    <div className="app-container">
      <div className="main-content">
        <Dashboard currentVitals={currentVitals} vitalsData={vitalsData} />
      </div>
      <div className="chatbot-sidebar">
        <AIChatbot vitalsData={{ current: currentVitals, history: vitalsData }} />
      </div>
    </div>
  )
}

export default App

