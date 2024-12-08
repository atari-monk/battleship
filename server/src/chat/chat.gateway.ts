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
  @WebSocketServer() server!: Server;

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
