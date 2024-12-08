import { NestFactory } from '@nestjs/core';
import * as socketIo from 'socket.io';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const server = app.getHttpServer();
  const io = new socketIo.Server(server, {
    cors: {
      origin: 'http://localhost:4200',
    },
  });

  io.on('connection', (socket) => {
    console.log(`A client connected. Socket id = ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`Client disconnected. Socket id = ${socket.id}`);
    });
  });

  await app.listen(3333);
}
bootstrap();
