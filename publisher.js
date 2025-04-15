const WebSocket = require('ws');
const mqtt = require('mqtt');

// WebSocket server setup
const wss = new WebSocket.Server({ port: 8081 });

// MQTT client setup
const mqttClient = mqtt.connect('mqtt://test.mosquitto.org:1883');
const MQTT_TOPIC = 'lightanywhere/toggle'; // Choose a unique topic to avoid conflicts

// Handle MQTT connection
mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  
  // Subscribe to receive messages
  mqttClient.subscribe(MQTT_TOPIC, (err) => {
    if (err) {
      console.error('MQTT subscription error:', err);
    } else {
      console.log('Subscribed to:', MQTT_TOPIC);
    }
  });
});

// Handle MQTT messages
mqttClient.on('message', (topic, message) => {
  if (topic === MQTT_TOPIC) {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received MQTT message:', data);
      
      // Broadcast to all WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'TOGGLE_UPDATE',
            value: data.value,
            timestamp: new Date().toISOString(),
            source: 'mqtt'
          }));
        }
      });
    } catch (error) {
      console.error('Error processing MQTT message:', error);
    }
  }
});

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received WebSocket message:', data);

      // Handle the toggle state change
      if (data.type === 'TOGGLE_SWITCH') {
        // Publish to MQTT
        mqttClient.publish(MQTT_TOPIC, JSON.stringify({
          value: data.value,
          timestamp: new Date().toISOString(),
          source: 'websocket'
        }));

        // Broadcast to all WebSocket clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'TOGGLE_UPDATE',
              value: data.value,
              timestamp: new Date().toISOString(),
              source: 'websocket'
            }));
          }
        });
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// Handle MQTT errors
mqttClient.on('error', (error) => {
  console.error('MQTT error:', error);
});

// Handle MQTT connection close
mqttClient.on('close', () => {
  console.log('MQTT connection closed');
});

// Clean up on process termination
process.on('SIGINT', () => {
  mqttClient.end();
  wss.close();
  process.exit();
});

console.log('WebSocket server running on ws://localhost:8081');
console.log('MQTT client connected to mqtt://test.mosquitto.org');


















