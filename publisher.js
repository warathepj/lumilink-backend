const WebSocket = require('ws');

// WebSocket server setup for testing
const wss = new WebSocket.Server({ port: 8086 });

// Log server startup
console.log('\n=== Test WebSocket Server Starting ===');
console.log('Time:', new Date().toISOString());
console.log('Port:', 8086);
console.log('================================\n');

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
        // Broadcast the toggle update to all connected clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            const updateMessage = {
              type: 'TOGGLE_UPDATE',
              value: data.value,
              room: data.room,
              timestamp: new Date().toISOString(),
              source: 'websocket'
            };
            client.send(JSON.stringify(updateMessage));
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

console.log('Test WebSocket server running on ws://localhost:8086');

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n=== Server Shutting Down ===');
  console.log('Time:', new Date().toISOString());
  wss.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

console.log('Test WebSocket server running on ws://localhost:8086');
