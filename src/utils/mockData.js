export function generateMockData() {
  const data = []
  const now = new Date()

  // Generate 50 readings going back in time
  for (let i = 50; i > 0; i--) {
    const timestamp = new Date(now.getTime() - i * 3 * 60 * 1000) // Every 3 minutes
    
    data.push({
      timestamp: timestamp.toLocaleString(),
      heartRate: 72 + Math.random() * 30 - 15, // 57-87 bpm
      spO2: 98 + Math.random() * 2 - 1, // 97-99%
      temperature: 98.6 + Math.random() * 1 - 0.5, // 98.1-99.1°F
      ecgStatus: Math.random() > 0.95 ? 'Irregular' : 'Normal'
    })
  }

  return data
}

export function simulateRealtimeUpdate(currentVitals) {
  return {
    ...currentVitals,
    heartRate: Math.max(60, Math.min(120, currentVitals.heartRate + (Math.random() - 0.5) * 10)),
    spO2: Math.max(95, Math.min(100, currentVitals.spO2 + (Math.random() - 0.5) * 2)),
    temperature: Math.max(98, Math.min(99.5, currentVitals.temperature + (Math.random() - 0.5) * 0.5)),
    timestamp: new Date()
  }
}
