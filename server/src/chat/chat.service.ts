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
