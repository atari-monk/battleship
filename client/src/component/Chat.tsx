import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const Chat: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [room, setRoom] = useState('general');

  useEffect(() => {
    // Connect to the backend socket
    const newSocket = io('http://localhost:3333'); // Replace with your backend URL
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

export default Chat;
