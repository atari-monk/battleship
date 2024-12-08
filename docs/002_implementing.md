# 002 Implementing (ts, nest server, react client)

## Technical notes

### nx cli

1. Generated game service and socket-events.service.ts (nest)

```bash
nx generate @nrwl/nest:service game --directory server/src/game
```

```bash
nx generate @nrwl/nest:service socket-events --directory server/src/game
```

### Problems

1. There was some errors with js modules as usual, adding "type": "commonjs", to root package and nx reset helped.

## Message on connection status.

Client:  
Connected to the server. Socket id = SY-JkHf4DXtaWK4GAAAF
or
Unable to connect to the server: xhr poll error

Server:  
A client connected. Socket id = 8yXq7zrogHTViL8xAAAB
A client connected. Socket id = 2yCoXbt9YBps18VIAAAD
Client disconnected. Socket id = 2yCoXbt9YBps18VIAAAD
Client disconnected. Socket id = 8yXq7zrogHTViL8xAAAB

## Chat Server

Here’s a basic NestJS service for a Socket.IO chat application, following the **Single Responsibility Principle (SRP)** and **SOLID** design principles.

### Steps to Implement:

1. Install required packages:

   ```bash
   npm install @nestjs/platform-socket.io socket.io
   ```

2. Create a `ChatService` and `ChatGateway`.

---

### Code Implementation

#### `chat.gateway.ts` (Gateway for Socket.IO Communication)

```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*', // Allow all origins (configure this in production)
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
    this.chatService.addClient(client.id);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.chatService.removeClient(client.id);
  }

  @SubscribeMessage('send_message')
  handleSendMessage(
    client: Socket,
    payload: { room: string; message: string }
  ): void {
    const { room, message } = payload;

    this.logger.log(`Message received: ${message} (room: ${room})`);
    this.server
      .to(room)
      .emit('receive_message', { message, sender: client.id });

    this.chatService.logMessage(room, client.id, message);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(client: Socket, room: string): void {
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
    client.emit('joined_room', room);
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(client: Socket, room: string): void {
    client.leave(room);
    this.logger.log(`Client ${client.id} left room ${room}`);
    client.emit('left_room', room);
  }
}
```

---

#### `chat.service.ts` (Service for Chat Logic)

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  private clients: Set<string> = new Set();
  private messages: Record<string, { sender: string; message: string }[]> = {};

  addClient(clientId: string): void {
    this.clients.add(clientId);
  }

  removeClient(clientId: string): void {
    this.clients.delete(clientId);
  }

  logMessage(room: string, sender: string, message: string): void {
    if (!this.messages[room]) {
      this.messages[room] = [];
    }
    this.messages[room].push({ sender, message });
  }

  getMessages(room: string): { sender: string; message: string }[] {
    return this.messages[room] || [];
  }
}
```

---

#### `app.module.ts` (Registering Chat Components)

```typescript
import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  providers: [ChatGateway, ChatService],
})
export class AppModule {}
```

---

### How It Works:

1. **ChatGateway**:

   - Handles WebSocket events (`send_message`, `join_room`, `leave_room`).
   - Manages client connections and room handling.

2. **ChatService**:
   - Stores connected clients and chat messages.
   - Implements the business logic for managing messages.

---

### Example Client

Use this minimal client to test the implementation:

```javascript
const socket = io('http://localhost:3000');

// Join a room
socket.emit('join_room', 'room1');

// Send a message
socket.emit('send_message', { room: 'room1', message: 'Hello World!' });

// Receive messages
socket.on('receive_message', (data) => {
  console.log('New message:', data);
});
```

This design ensures **separation of concerns** while remaining functional and extensible.

## Chat Client

Yes, you can create a React client component for the chat in the same NX monorepo. Here’s a concise example:

### Steps:

1. **Install `socket.io-client` in the React app:**

   ```bash
   npm install socket.io-client
   ```

2. **Create a Chat Component:**

#### `ChatComponent.tsx`

```tsx
import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const ChatComponent: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [room, setRoom] = useState('general');

  useEffect(() => {
    // Connect to the backend socket
    const newSocket = io('http://localhost:3000'); // Replace with your backend URL
    setSocket(newSocket);

    newSocket.on('receive_message', (data: { message: string }) => {
      setMessages((prev) => [...prev, data.message]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const joinRoom = () => {
    socket?.emit('join_room', room);
  };

  const sendMessage = () => {
    if (message.trim()) {
      socket?.emit('send_message', { room, message });
      setMessage('');
    }
  };

  return (
    <div>
      <h3>Chat Room: {room}</h3>
      <div>
        <input
          type="text"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Room name"
        />
        <button onClick={joinRoom}>Join Room</button>
      </div>
      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button onClick={sendMessage}>Send</button>
      </div>
      <div>
        <h4>Messages:</h4>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChatComponent;
```

3. **Use the Component:**
   Import and use `ChatComponent` in your React app’s pages or components.

---

### Advantages of NX Monorepo:

- **Shared Types:** You can define shared types (e.g., message payloads) in a shared library and use them in both client and server.
- **Centralized Management:** Easier to manage dependencies and configurations for both the client and server.

This setup will enable the chat component to communicate with your NestJS WebSocket server effectively.

In tsconfig.json add dom to have dom types.

```json
{
  "compilerOptions": {
    "lib": ["dom"], // Add "dom" here
    "jsx": "react-jsx",
    "strict": true,
    "module": "esnext",
    "target": "esnext"
  }
}
```

## Shared library

1. Generate lib, selected options: vite, eslint, vitest

```bash
nx generate @nrwl/js:lib shared
```

2. root package.json paths updated

```json
"paths": {
      "@client/*": ["client/src/*"],
      "@server/*": ["server/src/*"],
      "@shared/*": ["shared/src/index.ts"]
    },
```

## a
