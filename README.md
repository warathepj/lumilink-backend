# ซอร์สโค้ดนี้ ใช้สำหรับเป็นตัวอย่างเท่านั้น ถ้านำไปใช้งานจริง ผู้ใช้ต้องจัดการเรื่องความปลอดภัย และ ประสิทธิภาพด้วยตัวเอง

# LightAnywhere

A real-time light control system with mobile app, backend server, and simulator components.

## 🏗️ Project Structure

The project consists of three main components:

```
/
├── app/            # Mobile application (Expo/React Native)
├── backend/        # MQTT broker and WebSocket server
└── sim/            # Light simulator
```

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- Expo Go app (for mobile development)
- iOS Simulator (for iOS development on macOS)
- Android Studio & Android Emulator (for Android development)

### Repository

```bash
https://github.com/warathepj/lightanywhere.git
https://github.com/warathepj/lightanywhere-backend.git
https://github.com/warathepj/lightanywhere-simulator.git
```

### Installation and Setup

#### 1. Mobile App (app/)

```bash
cd app
npm install
npx expo start
```

Development options:

- Use Expo Go app for physical device testing
- Press 'i' for iOS Simulator
- Press 'a' for Android Emulator
- Press 'w' for web browser

#### 2. Backend Server (backend/)

```bash
cd backend
npm install
# Start the publisher
npm start
# Start the subscriber (in a new terminal)
node subscriber.js
```

The backend provides:

- MQTT broker connection (test.mosquitto.org:1883) _for test only, not for production_
- WebSocket server for real-time communication
- Message handling between app and simulator

#### 3. Simulator (sim/)

```bash
cd sim
# open index.html with browser or use live server
```

## 📡 Communication Flow

```
Mobile App <-> Backend (MQTT/WebSocket) <-> Simulator
```

- MQTT Topic: `lightanywhere/toggle` _create your own topic_
- WebSocket Ports:
  - Publisher: 8081
  - Subscriber: 8085

## 🛠️ Built With

### Mobile App

- [Expo](https://expo.dev/) - Development platform
- [React Native](https://reactnative.dev/) - Mobile framework
- [TypeScript](https://www.typescriptlang.org/) - Programming language

### Backend

- [MQTT.js](https://github.com/mqttjs/MQTT.js) - MQTT client
- [ws](https://github.com/websockets/ws) - WebSocket server
- Node.js

### Simulator

- WebSocket client
- Real-time light state visualization

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details
