# ซอร์สโค้ดนี้ ใช้สำหรับเป็นตัวอย่างเท่านั้น ถ้านำไปใช้งานจริง ผู้ใช้ต้องจัดการเรื่องความปลอดภัย และ ประสิทธิภาพด้วยตัวเอง

# LumiLink System

A comprehensive real-time light control system consisting of a mobile app, backend server, and web-based simulator.

## 🏗️ Project Structure

```
/
├── app/            # Mobile application (Expo/React Native)
├── backend/        # MQTT broker and WebSocket server
└── simulator/      # Web-based light simulator
```

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS version)
- npm or yarn
- Expo Go app (for mobile development)
- iOS Simulator (for iOS development on macOS)
- Android Studio & Android Emulator (for Android development)

### Repository

```bash
# Mobile Application
https://github.com/warathepj/lumilink-app.git

# Backend Server
https://github.com/warathepj/lumilink-backend.git

# Web-based Hardware Simulator
https://github.com/warathepj/home-glow-simulator.git
```

### Installation and Setup

#### 1. Mobile App (app/)

```bash
cd lumilink-app
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
cd lumilink-backend
npm install
# Start the publisher
npm start
# Start the subscriber (in a new terminal)
node subscriber.js
```

#### 3. Simulator (simulator/)

```bash
cd home-glow-simulator
npm install
npm run dev
```

The simulator will be available at `http://localhost:8080`

## 🛠️ Tech Stack

### Mobile App

- [Expo](https://expo.dev/) - Development platform
- [React Native](https://reactnative.dev/) - Mobile framework
- [TypeScript](https://www.typescriptlang.org/) - Programming language

### Backend

- [Node.js](https://nodejs.org/) - Runtime environment
- [MQTT.js](https://github.com/mqttjs/MQTT.js) - MQTT client
- [ws](https://github.com/websockets/ws) - WebSocket server

### Simulator

- [Vite](https://vitejs.dev/) - Build tool
- [React](https://reactjs.org/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Programming language
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components

## 🎮 Features

### Mobile App

- Real-time light control interface
- Room-based lighting management
- MQTT integration for IoT communication
- Status indicators
- Activity logging

### Backend

- MQTT broker connection (https://mosquitto.org/download)
- WebSocket server for real-time communication
- Message handling between app and simulator

### Simulator

- Interactive room lighting controls
- Real-time status updates
- WebSocket communication
- Connection status monitoring
- Mobile-responsive design

## 📡 Communication Flow

```
Mobile App <-> Backend (MQTT/WebSocket) <-> Simulator
```

### Connection Details

- MQTT Topic: `lumilink/toggle` _create your own topic_
- WebSocket Ports:
  - Publisher: 8081
  - Subscriber: 8085

## 🔧 Configuration

### Mobile App

- Expo configuration in `app.json`

### Backend

- MQTT broker settings in environment variables

### Simulator

- Room configurations in context
- UI theme customization via Tailwind

## ⚠️ Security Notice

Current configuration is for development purposes only. For production:

- Use secure MQTT broker
- Implement proper authentication
- Enable SSL/TLS
- Configure proper access controls
- Handle error cases
- Implement logging

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details

## ⚠️ Disclaimer

This source code is for demonstration purposes only. Users must implement their own security and performance measures for production use.

# Update 1May2025

These updates reflect the MongoDB integration in the subscriber.js file, which stores toggle messages in a MongoDB database called "LumiLink" in the "toggles" collection. The changes include adding MongoDB to prerequisites, tech stack, features, connection details, configuration, and security considerations.
