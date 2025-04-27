const mqtt = require('mqtt');
const WebSocket = require('ws');
require('dotenv').config();

// WebSocket server setup
const wss = new WebSocket.Server({ port: 8085 }); // Using different port than publisher

// MQTT client setup with env variables
const mqttClient = mqtt.connect(process.env.BROKER_URL, {
  username: process.env.USER,
  password: process.env.PASSWORD
});
const MQTT_TOPIC = 'lumilink/toggle';

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('Simulator WebSocket client connected');

  ws.on('close', () => {
    console.log('Simulator WebSocket client disconnected');
  });
});

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

// Handle MQTT messages and forward to simulator
mqttClient.on('message', (topic, message) => {
  if (topic === MQTT_TOPIC) {
    try {
      const data = JSON.parse(message.toString());
      console.log('\n=== MQTT Message Received ===');
      console.log('Time:', new Date().toISOString());
      console.log('Topic:', topic);
      console.log('Value:', data.value);
      console.log('Room:', data.room);
      console.log('Source:', data.source);
      console.log('Timestamp:', data.timestamp);
      console.log('Raw message:', JSON.stringify(data, null, 2));
      console.log('==========================\n');

      // Broadcast to all connected simulators
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'TOGGLE_UPDATE',
            value: data.value,
            room: data.room,         // Include room in the forwarded message
            timestamp: data.timestamp,
            source: data.source
          }));
        }
      });
    } catch (error) {
      console.error('\n=== Error Log ===');
      console.error('Time:', new Date().toISOString());
      console.error('Error:', error.message);
      console.error('Raw message:', message.toString());
      console.error('================\n');
    }
  }
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

console.log('MQTT subscriber running...');
console.log('Connecting to mqtt://test.mosquitto.org');
console.log('WebSocket server running on ws://localhost:8085');
console.log('Listening on topic:', MQTT_TOPIC);

