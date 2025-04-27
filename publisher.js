const WebSocket = require('ws');
const mqtt = require('mqtt');
require('dotenv').config();

// MQTT client setup with env variables
const mqttClient = mqtt.connect(process.env.BROKER_URL, {
  username: process.env.USER,
  password: process.env.PASSWORD
});
const MQTT_TOPIC = 'lumilink/toggle';

// WebSocket server setup for testing
const wss = new WebSocket.Server({ port: 8086 });

// Log server startup
console.log('\n=== Test WebSocket Server Starting ===');
console.log('Time:', new Date().toISOString());
console.log('Port:', 8086);
console.log('================================\n');

// Handle MQTT connection
mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
});

// Handle MQTT errors
mqttClient.on('error', (error) => {
  console.error('MQTT error:', error);
});

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log('\n=== New Client Connected ===');
  console.log('Time:', new Date().toISOString());
  console.log('Client IP:', clientIp);
  console.log('==========================\n');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      // Handle toggle messages from app
      if (data.type === 'TOGGLE_SWITCH') {
        // Publish to MQTT broker
        const mqttMessage = {
          type: 'TOGGLE_UPDATE',
          value: data.value,
          room: data.room,
          timestamp: new Date().toISOString(),
          source: 'websocket'
        };
        mqttClient.publish(MQTT_TOPIC, JSON.stringify(mqttMessage));

        // Broadcast the toggle update to all connected clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(mqttMessage));
          }
        });
      }
      
      // Enhanced logging for test messages
      console.log('\n=== Test Log Data ===');
      console.log('Time:', new Date().toISOString());
      console.log('Client:', clientIp);
      console.log('Type:', data.type);
      console.log('Value:', data.value);
      console.log('Room:', data.room);
      console.log('Raw message:', JSON.stringify(data, null, 2));
      console.log('===================\n');
    } catch (error) {
      console.error('\n=== Error Log ===');
      console.error('Time:', new Date().toISOString());
      console.error('Client:', clientIp);
      console.error('Error:', error.message);
      console.error('Raw message:', message.toString());
      console.error('===============\n');
    }
  });

  ws.on('error', (error) => {
    console.error('\n=== WebSocket Error ===');
    console.error('Time:', new Date().toISOString());
    console.error('Client:', clientIp);
    console.error('Error:', error.message);
    console.error('=====================\n');
  });

  ws.on('close', () => {
    console.log('\n=== Client Disconnected ===');
    console.log('Time:', new Date().toISOString());
    console.log('Client:', clientIp);
    console.log('=========================\n');
  });
});

// Handle server errors
wss.on('error', (error) => {
  console.error('\n=== Server Error ===');
  console.error('Time:', new Date().toISOString());
  console.error('Error:', error.message);
  console.error('==================\n');
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n=== Server Shutting Down ===');
  console.log('Time:', new Date().toISOString());
  mqttClient.end();
  wss.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

console.log('Test WebSocket server running on ws://localhost:8086');
console.log('Connected to MQTT broker:', process.env.BROKER_URL);
console.log('Publishing to topic:', MQTT_TOPIC);
