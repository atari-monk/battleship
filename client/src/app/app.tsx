// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.css';
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
