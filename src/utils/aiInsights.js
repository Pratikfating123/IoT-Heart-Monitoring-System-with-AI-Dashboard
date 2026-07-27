// AI Health Insights Generator
// This uses pattern matching and rules-based analysis since Groq API requires server-side authentication

export async function generateHealthInsights(userQuery, vitalsData) {
  const query = userQuery.toLowerCase()
  const current = vitalsData.current || {}
  const history = vitalsData.history || []

  // Calculate statistics
  const stats = calculateStats(history)
  const assessment = assessVitals(current)

  // Generate contextual responses
  if (query.includes('heart rate') || query.includes('heart') || query.includes('hr')) {
    return generateHeartRateInsight(current, stats, assessment)
  }

  if (query.includes('oxygen') || query.includes('spo2') || query.includes('o2')) {
    return generateSpO2Insight(current, stats, assessment)
  }

  if (query.includes('temperature') || query.includes('temp') || query.includes('fever')) {
    return generateTemperatureInsight(current, assessment)
  }

  if (query.includes('overall') || query.includes('status') || query.includes('health') || query.includes('how am i')) {
    return generateOverallHealthInsight(current, stats, assessment)
  }

  if (query.includes('trend') || query.includes('pattern') || query.includes('change')) {
    return generateTrendInsight(history, stats)
  }

  if (query.includes('recommendation') || query.includes('should i') || query.includes('what should')) {
    return generateRecommendation(current, assessment)
  }

  // Default response
  return generateDefaultResponse(current, stats, assessment)
}

function calculateStats(history) {
  if (!history || history.length === 0) {
    return {
      avgHeartRate: 0,
      avgSpO2: 0,
      avgTemp: 0,
      maxHeartRate: 0,
      minHeartRate: 0,
      readings: 0
    }
  }

  const heartRates = history.map(h => h.heartRate)
  const spO2s = history.map(h => h.spO2)
  const temps = history.map(h => h.temperature)

  return {
    avgHeartRate: (heartRates.reduce((a, b) => a + b, 0) / heartRates.length).toFixed(1),
    avgSpO2: (spO2s.reduce((a, b) => a + b, 0) / spO2s.length).toFixed(1),
    avgTemp: (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1),
    maxHeartRate: Math.max(...heartRates).toFixed(0),
    minHeartRate: Math.min(...heartRates).toFixed(0),
    readings: history.length
  }
}

function assessVitals(vitals) {
  const assessment = {
    heartRateStatus: vitals.heartRate < 60 ? 'low' : vitals.heartRate > 100 ? 'high' : 'normal',
    spO2Status: vitals.spO2 < 95 ? 'critical' : vitals.spO2 < 98 ? 'warning' : 'normal',
    tempStatus: vitals.temperature > 99 ? 'elevated' : 'normal'
  }
  return assessment
}

function generateHeartRateInsight(current, stats, assessment) {
  const hr = Math.round(current.heartRate)
  let insight = `Your current heart rate is ${hr} bpm, which is `

  if (assessment.heartRateStatus === 'low') {
    insight += 'lower than normal. This can happen during rest or relaxation. If you feel unusually tired or dizzy, consider consulting a healthcare provider.'
  } else if (assessment.heartRateStatus === 'high') {
    insight += 'higher than normal. This could be due to physical activity, stress, or caffeine intake. Try relaxing and monitor it over time.'
  } else {
    insight += 'within the normal range for a resting heart rate. Great!'
  }

  if (stats.readings > 0) {
    insight += ` Your average heart rate over the last ${stats.readings} readings is ${stats.avgHeartRate} bpm, with a range of ${stats.minHeartRate}-${stats.maxHeartRate} bpm.`
  }

  return insight
}

function generateSpO2Insight(current, stats, assessment) {
  const spO2 = current.spO2.toFixed(1)
  let insight = `Your oxygen saturation level is ${spO2}%, which is `

  if (assessment.spO2Status === 'critical') {
    insight += 'critically low. This requires immediate medical attention. Please seek professional help.'
  } else if (assessment.spO2Status === 'warning') {
    insight += 'slightly low. Monitor your breathing and consider consulting a healthcare provider if it remains below 95%.'
  } else {
    insight += 'healthy and normal. Keep it up!'
  }

  if (stats.readings > 0) {
    insight += ` Your average SpO2 is ${stats.avgSpO2}%.`
  }

  return insight
}

function generateTemperatureInsight(current, assessment) {
  const temp = current.temperature.toFixed(1)
  let insight = `Your body temperature is ${temp}°F, which is `

  if (assessment.tempStatus === 'elevated') {
    insight += 'elevated. This may indicate a fever. Stay hydrated and consider resting. If it persists, consult a healthcare provider.'
  } else {
    insight += 'normal. Your body temperature is in a healthy range.'
  }

  return insight
}

function generateOverallHealthInsight(current, stats, assessment) {
  let insight = 'Your overall health status: '

  const issues = []
  if (assessment.heartRateStatus === 'high') issues.push('elevated heart rate')
  if (assessment.spO2Status === 'warning') issues.push('low oxygen levels')
  if (assessment.tempStatus === 'elevated') issues.push('elevated temperature')

  if (issues.length === 0) {
    insight += 'All vital signs are looking good! Your heart rate, oxygen levels, and temperature are all within healthy ranges.'
  } else {
    insight += `I notice some areas that might need attention: ${issues.join(', ')}. Please monitor these and consult a healthcare provider if symptoms persist.`
  }

  return insight
}

function generateTrendInsight(history, stats) {
  if (!history || history.length < 3) {
    return 'Not enough data for trend analysis. Please collect more readings over time.'
  }

  const recentReadings = history.slice(-5)
  const olderReadings = history.slice(Math.max(0, history.length - 10), history.length - 5)

  const recentAvgHR = recentReadings.reduce((sum, r) => sum + r.heartRate, 0) / recentReadings.length
  const olderAvgHR = olderReadings.length > 0 
    ? olderReadings.reduce((sum, r) => sum + r.heartRate, 0) / olderReadings.length 
    : recentAvgHR

  let trend = 'Your heart rate trends: '
  if (recentAvgHR > olderAvgHR + 5) {
    trend += 'showing an upward trend. Your recent readings are higher than before.'
  } else if (recentAvgHR < olderAvgHR - 5) {
    trend += 'showing a downward trend. Your recent readings are lower than before.'
  } else {
    trend += 'stable. Your heart rate has remained relatively consistent.'
  }

  return trend
}

function generateRecommendation(current, assessment) {
  let recommendation = 'My recommendations: '
  
  const suggestions = []
  
  if (assessment.heartRateStatus === 'high') {
    suggestions.push('Try relaxation techniques like deep breathing or meditation to lower your heart rate')
  }
  
  if (assessment.spO2Status === 'warning') {
    suggestions.push('Ensure you are in a well-ventilated area and monitor your breathing')
  }
  
  if (assessment.tempStatus === 'elevated') {
    suggestions.push('Stay hydrated and rest to help regulate your body temperature')
  }
  
  if (suggestions.length === 0) {
    suggestions.push('Keep up your current healthy routine! Continue monitoring your vitals regularly')
  }
  
  recommendation += suggestions.join('. ') + '.'
  return recommendation
}

function generateDefaultResponse(current, stats, assessment) {
  return `I can help you understand your vital signs! Here's what I see: Your heart rate is ${Math.round(current.heartRate)} bpm, SpO2 is ${current.spO2.toFixed(1)}%, and temperature is ${current.temperature.toFixed(1)}°F. Try asking about specific vitals like 'How is my heart rate?' or 'What about my oxygen levels?'`
}
