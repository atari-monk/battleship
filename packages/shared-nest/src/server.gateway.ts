import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway() // Decorator that marks the class as a gateway
export class GatewayGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  // Server object is automatically injected by the framework
  server!: Server;

  handleConnection(client: Socket) {
    console.log('Client connected: ', client.id);
    // Emit a message to the connected client
    client.emit('message', 'Welcome to the Socket.IO server');
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected: ', client.id);
  }
}
