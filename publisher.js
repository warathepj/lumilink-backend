const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('message', (message) => {    try {
      const data = JSON.parse(message);      console.log('Received:', data);
      // Handle the toggle state change
      if (data.type === 'TOGGLE_SWITCH') {        // Broadcast to all connected clients
        wss.clients.forEach((client) => {          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({              type: 'TOGGLE_UPDATE',
              value: data.value,              timestamp: new Date().toISOString()
            }));          }
        });      }
    } catch (error) {      console.error('Error processing message:', error);
    }  });
  ws.on('close', () => {
    console.log('Client disconnected');  });
});

console.log('WebSocket server running on ws://localhost:8080');


















