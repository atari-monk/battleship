# 001 Starting project with nx (ts server, react client)

**Question** I need template, doc with step by step setup of a web project where we use nx, to set up client and server, all typescript, socket-io. I need to have doc/instructions for this.

Here’s a step-by-step guide for setting up a web project with **NX**, **TypeScript**, **Socket.IO**, and separate client and server applications. The project will use the NX monorepo setup, where we’ll have the client-side and server-side applications as separate apps.

## My Notes during coding this:

### **Do this to make life bareable**

1. Each step should be seperate commit, to discard changes when code is generated with mistake.

### **Seps i needed to make this work**

1. node plugin

```bash
npm install -g nx@latest
```

```bash
npm install --save-dev @nrwl/node
```

2. react plugin

```bash
npm install --save-dev @nrwl/react
```

### **Notes**

1. Server: nest, root (default)
2. Client: reacr, css, single page (no router), playwright, vite, root (default)
3. npm i had some version conflits, but chatgpt sugested downgrade and it went away
4. Warning! there is no need to install packages on apps, in monorepo installing is in root (point of monorepo).
5. When copying code of server, adjust imports (there is app module in project (nest)).
6. When building server there were several config errors. Server configs marked red with lines red. Errors and Chatgpt sugested corrections. After configs update build was ok.
7. Client was served no problem, ok.
8. Upon test of server, client, this setup worked.
9. I copied this to nx-web-template. This will serve as seed project.

## Guide that was run:

### **Step-by-Step Setup Guide**

---

### **1. Install NX CLI**

Install the NX CLI globally to get started:

```bash
npm install -g nx
```

### **2. Create an NX Workspace**

Create a new NX workspace with the `apps` and `libs` structure.

```bash
npx create-nx-workspace@latest my-web-project
```

During setup, select:

- **Workspace**: `apps`
- **Preset**: `empty` (this creates a clean setup)
- **Package manager**: `npm` (or yarn if preferred)

Navigate to the newly created workspace:

```bash
cd my-web-project
```

### **3. Create Server and Client Applications**

Now, let’s create two applications: one for the **client** (frontend) and one for the **server** (backend).

#### **Create Server App**

```bash
nx generate @nrwl/node:application server
```

This will generate a Node.js server under the `apps/server` directory.

#### **Create Client App**

```bash
nx generate @nrwl/react:application client
```

This will generate a React client app under the `apps/client` directory.

### **4. Set Up Socket.IO on the Server**

Install the required Socket.IO dependencies in the server application:

```bash
cd apps/server
npm install socket.io
```

Update the `main.ts` (entry file) of the server to set up the Socket.IO server.

```typescript
// apps/server/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as socketIo from 'socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const server = app.getHttpServer();
  const io = new socketIo.Server(server, {
    cors: {
      origin: 'http://localhost:4200', // Frontend URL
    },
  });

  io.on('connection', (socket) => {
    console.log('A client connected');
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  await app.listen(3333); // Server runs on port 3333
}
bootstrap();
```

### **5. Set Up Socket.IO on the Client**

Install the Socket.IO client for React.

```bash
cd apps/client
npm install socket.io-client
```

Then, set up the client to connect to the server. You can use React’s `useEffect` hook to establish the connection.

```tsx
// apps/client/src/app/app.tsx
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3333'); // Pointing to the server

const App = () => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to the server');
    });

    return () => {
      socket.off('connect');
    };
  }, []);

  return (
    <div>
      <h1>Socket.IO with NX Setup</h1>
      <p>{message}</p>
    </div>
  );
};

export default App;
```

### **6. Enable CORS for Socket.IO**

Ensure your Socket.IO server (Node.js) allows CORS from the frontend:

```typescript
// apps/server/src/main.ts (Socket.IO setup)
const io = new socketIo.Server(server, {
  cors: {
    origin: 'http://localhost:4200', // The frontend URL
  },
});
```

### **7. Running the Applications**

Now you can run the server and client applications:

- Start the **server**:

```bash
nx serve server
```

- Start the **client**:

```bash
nx serve client
```

The client app will run on `http://localhost:4200`, and the server will be on `http://localhost:3333`.

### **8. Optional: Set Up TypeScript Path Aliases**

For better import management across your apps, you can set up TypeScript path aliases. In the `tsconfig.base.json` file in the root of your workspace, you can add the following:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@client/*": ["apps/client/src/*"],
      "@server/*": ["apps/server/src/*"]
    }
  }
}
```

This allows you to use `@client/*` and `@server/*` for imports across your NX workspace.

---

### **Folder Structure After Setup**

```plaintext
my-web-project/
├── apps/
│   ├── client/           # React frontend
│   │   ├── src/
│   │   └── ...
│   └── server/           # Node.js backend with Socket.IO
│       ├── src/
│       └── ...
├── libs/                 # Shared libraries (if any)
├── tsconfig.base.json    # TypeScript base config
└── nx.json               # NX workspace config
```

---

### **9. Final Notes**

- Ensure that the server and client run on different ports (e.g., `3333` for the server and `4200` for the client).
- You can enhance the server by integrating other services (e.g., NestJS, Express) or adding more advanced Socket.IO features like rooms and broadcasting.

---

This setup creates a clean monorepo structure using NX with TypeScript for both client and server, and integrates Socket.IO for real-time communication between them.
