// ThingBoard.io API Configuration
const THINGBOARD_CONFIG = {
  baseUrl: 'https://thingsboard.thinknook.io/api/plugins/telemetry/DEVICE',
  wsUrl: 'ws://thingsboard.thinknook.io/api/ws/plugins/telemetry',
  deviceId: '8610cb60-2eb2-11f1-9c6f-b71bb2771567',
  token: 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJwcmF0aWtmYXRpbmc3N0BnbWFpbC5jb20iLCJ1c2VySWQiOiI0OTk5ZTEyMC0yOWVmLTExZjEtYWZkNy1lYjQzMGJmYjQyN2YiLCJzY29wZXMiOlsiVEVOQU5UX0FETUlOIl0sInNlc3Npb25JZCI6ImRhMjYzMmM4LTM0MWUtNDExNy1iMDljLWM1ZWEwMTM5Njc1MCIsImV4cCI6MTc3NTUyODU0NywiaXNzIjoidGhpbmdzYm9hcmQuY2xvdWQiLCJpYXQiOjE3NzU0OTk3NDcsImVuYWJsZWQiOnRydWUsImlzUHVibGljIjpmYWxzZSwiaXNCaWxsaW5nU2VydmljZSI6ZmFsc2UsInByaXZhY3lQb2xpY3lBY2NlcHRlZCI6dHJ1ZSwidGVybXNPZlVzZUFjY2VwdGVkIjp0cnVlLCJ0ZW5hbnRJZCI6IjQ5NmI1NzEwLTI5ZWYtMTFmMS1hZmQ3LWViNDMwYmZiNDI3ZiIsImN1c3RvbWVySWQiOiIxMzgxNDAwMC0xZGQyLTExYjItODA4MC04MDgwODA4MDgwODAifQ.bYNDVKkB2UZeG5N-nR86Z_kimXsBbrf3SAsaBT9TngWVGj_HNeq4GuKfYXI2usO1by6d5CO70_jUv6rqdhFRYA'
}

// Possible field name variations
const FIELD_MAPPINGS = {
  heartRate: ['heartRate', 'heart_rate', 'hr', 'bpm', 'HeartRate', 'heartbeat'],
  spo2: ['spo2', 'SpO2', 'spo', 'oxygen', 'SpO2', 'o2sat']
};

// Try to find value from data with multiple field name possibilities
function findValue(data, possibleKeys) {
  for (const key of possibleKeys) {
    if (data[key] && data[key].length > 0) {
      return data[key][0];
    }
  }
  return null;
}

// Fetch latest telemetry data from ThingBoard
export async function fetchLatestTelemetry() {
  try {
    // Get all keys at once
    const allKeys = [...FIELD_MAPPINGS.heartRate, ...FIELD_MAPPINGS.spo2].join(',');
    const url = `${THINGBOARD_CONFIG.baseUrl}/${THINGBOARD_CONFIG.deviceId}/values/timeseries?keys=${allKeys}&order=DESC&limit=1`;
    
    console.log('Fetching from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Authorization': `Bearer ${THINGBOARD_CONFIG.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('ThingBoard Response:', data);
    
    // Try to find heart rate with multiple field name variations
    const hrData = findValue(data, FIELD_MAPPINGS.heartRate);
    const spo2Data = findValue(data, FIELD_MAPPINGS.spo2);
    
    if (hrData || spo2Data) {
      return {
        heartRate: hrData ? parseFloat(hrData.value) : 72,
        spO2: spo2Data ? parseFloat(spo2Data.value) : 98,
        temperature: 98.6,
        ecgStatus: hrData && parseFloat(hrData.value) > 100 ? 'Irregular' : 'Normal',
        timestamp: new Date(hrData ? hrData.ts : Date.now())
      };
    }

    console.log('No telemetry data found in response');
    return null;
  } catch (error) {
    console.error('Error fetching telemetry:', error);
    return null;
  }
}

// Fetch historical telemetry data
export async function fetchHistoricalTelemetry(startTime, endTime) {
  try {
    const url = `${THINGBOARD_CONFIG.baseUrl}/${THINGBOARD_CONFIG.deviceId}/values/timeseries?keys=heartRate,spo2&startTime=${startTime}&endTime=${endTime}&order=DESC&limit=100`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Authorization': `Bearer ${THINGBOARD_CONFIG.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    const historicalData = [];
    
    if (data && data.heartRate) {
      data.heartRate.forEach((hrReading, index) => {
        const spo2Reading = data.spo2 ? data.spo2[index] : null;
        
        historicalData.push({
          timestamp: new Date(hrReading.ts).toLocaleString(),
          heartRate: parseFloat(hrReading.value),
          spO2: spo2Reading ? parseFloat(spo2Reading.value) : 98,
          temperature: 98.6,
          ecgStatus: parseFloat(hrReading.value) > 100 ? 'Irregular' : 'Normal'
        });
      });
    }

    return historicalData.reverse(); // Oldest first
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return [];
  }
}

// WebSocket connection for real-time updates
export function createTelemetrySubscription(callback) {
  const ws = new WebSocket(THINGBOARD_CONFIG.wsUrl);

  ws.onopen = () => {
    console.log('WebSocket connected to ThingBoard');
    
    // Subscribe to device telemetry
    const subscribeMsg = {
      tsSubCmds: [
        {
          entityType: 'DEVICE',
          entityId: THINGBOARD_CONFIG.deviceId,
          keys: ['heartRate', 'spo2'],
          cmdId: 1
        }
      ],
      authCmd: {
        token: THINGBOARD_CONFIG.token
      }
    };
    
    ws.send(JSON.stringify(subscribeMsg));
  };

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      
      if (message.data && (message.data.heartRate || message.data.spo2)) {
        const telemetry = {
          heartRate: message.data.heartRate ? message.data.heartRate[0][1] : 72,
          spO2: message.data.spo2 ? message.data.spo2[0][1] : 98,
          temperature: 98.6,
          ecgStatus: message.data.heartRate && message.data.heartRate[0][1] > 100 ? 'Irregular' : 'Normal',
          timestamp: new Date()
        };
        
        callback(telemetry);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected from ThingBoard');
  };

  return ws;
}

export default {
  fetchLatestTelemetry,
  fetchHistoricalTelemetry,
  createTelemetrySubscription
};
