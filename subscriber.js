const WebSocket = require('ws');
const mqtt = require('mqtt');
require('dotenv').config();
const { MongoClient } = require('mongodb'); // Add MongoDB client

// MongoDB connection setup
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'LumiLink';
let db;

// Connect to MongoDB
MongoClient.connect(mongoUrl, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db(dbName);
  })
  .catch(error => {
    console.error('MongoDB connection error:', error);
  });

// MQTT client setup with env variables
const mqttClient = mqtt.connect(process.env.BROKER_URL, {
username: process.env.USER,
password: process.env.PASSWORD
});

const MQTT_TOPIC = 'lumilink/toggle';

// WebSocket server setup for testing
const wss = new WebSocket.Server({ port: 8085 });

// Log server startup
console.log('\n=== Test WebSocket Server Starting ===');
console.log('Time:', new Date().toISOString());
console.log('Port:', 8085);
console.log('================================\n');

// Track messages to prevent duplicates
const processedMessages = new Map();
const MESSAGE_EXPIRY_MS = 2000; // Time window to detect duplicates (2 seconds)

// Add a separate map for MQTT messages
const processedMqttMessages = new Map();

// Handle MQTT connection
mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  // Subscribe to the topic to receive messages
  mqttClient.subscribe(MQTT_TOPIC, (err) => {
    if (!err) {
      console.log(`Subscribed to topic: ${MQTT_TOPIC}`);
    } else {
      console.error('MQTT subscription error:', err);
    }
  });
});

// Handle MQTT errors
mqttClient.on('error', (error) => {
console.error('MQTT error:', error);
});

// Add this handler for incoming MQTT messages
mqttClient.on('message', (topic, message) => {
  try {
    const data = JSON.parse(message.toString());

    // Generate a message ID for duplicate detection - ignore timestamp
    const messageId = data.messageId || `${data.type}-${data.room}-${data.value}-${data.source}`;
    const now = Date.now();

    // Check if we've seen this message recently
    if (processedMqttMessages.has(messageId)) {
      const lastProcessed = processedMqttMessages.get(messageId);
      if (now - lastProcessed < MESSAGE_EXPIRY_MS) {
        console.log(`\n=== Duplicate MQTT message detected (${now - lastProcessed}ms) - Skipping ===`);
        return; // Skip processing this duplicate message
      }
    }

    // Record that we've processed this message
    processedMqttMessages.set(messageId, now);

    // Clean up old entries in the processed messages map
    for (const [key, timestamp] of processedMqttMessages.entries()) {
      if (now - timestamp > MESSAGE_EXPIRY_MS) {
        processedMqttMessages.delete(key);
      }
    }

    console.log('\n=== MQTT Message Received ===');
    console.log('Time:', new Date().toISOString());
    console.log('Topic:', topic);
    console.log('Type:', data.type); // Assuming type exists, adjust if needed
    console.log('Value:', data.value);
    console.log('Room:', data.room);
    console.log('Source:', data.source);
    console.log('Message ID:', data.messageId); // Log message ID if present
    console.log('Raw message:', message.toString());
    console.log('===========================\n');

    // Save MQTT message to MongoDB toggles collection
    if (db) {
      db.collection('toggles').insertOne({
        ...data,
        receivedAt: new Date(),
        topic: topic,
        source: data.source || 'mqtt' // Ensure source is captured
      })
      .then(() => console.log('MQTT message saved to database'))
      .catch(err => console.error('Error saving MQTT message to database:', err));
    }

    // Broadcast to all connected WebSocket clients (simulators)
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        // Forward a structured message, similar to subscriber-0.js
        client.send(JSON.stringify({
          type: 'TOGGLE_UPDATE', // Use a consistent type for simulator updates
          value: data.value,
          room: data.room,
          timestamp: data.timestamp || new Date().toISOString(), // Use provided timestamp or generate new one
          source: data.source
        }));
      }
    });

  } catch (error) {
    console.error('\n=== Error Processing MQTT Message ===');
    console.error('Time:', new Date().toISOString());
    console.error('Topic:', topic);
    console.error('Error:', error.message);
    console.error('Raw message:', message.toString());
    console.error('===================================\n');
  }
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

      // Generate a message ID based on content to detect duplicates
      const messageId = `${data.type}-${data.room}-${data.value}-${clientIp}`;
      const now = Date.now();

      // Check if we've seen this message recently
      if (processedMessages.has(messageId)) {
        const lastProcessed = processedMessages.get(messageId);
        if (now - lastProcessed < MESSAGE_EXPIRY_MS) {
          console.log(`\n=== Duplicate message detected (${now - lastProcessed}ms) - Skipping ===`);
          return; // Skip processing this duplicate message
        }
      }

      // Record that we've processed this message
      processedMessages.set(messageId, now);

      // Clean up old entries in the processed messages map
      for (const [key, timestamp] of processedMessages.entries()) {
        if (now - timestamp > MESSAGE_EXPIRY_MS) {
          processedMessages.delete(key);
        }
      }

      // Handle toggle messages from app
      if (data.type === 'TOGGLE_SWITCH') {
        // Set a unique message ID to help identify potential duplicates
        const mqttMessage = {
          type: 'TOGGLE_UPDATE',
          value: data.value,
          room: data.room,
          timestamp: new Date().toISOString(),
          source: 'websocket',
          messageId: `${Date.now()}-${Math.random().toString(36).substring(2, 10)}` // Add unique ID
        };

        // Publish to MQTT broker - Commented out as requested
        // mqttClient.publish(MQTT_TOPIC, JSON.stringify(mqttMessage));
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
console.error('Time:', new Date().toISODateTime());
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

console.log('Test WebSocket server running on ws://localhost:8085');
console.log('Connected to MQTT broker:', process.env.BROKER_URL);
console.log('Publishing to topic:', MQTT_TOPIC);
