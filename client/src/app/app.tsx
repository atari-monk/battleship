//import styles from './app.module.css';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3333');

const App = () => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    socket.on('connect', () => {
      setMessage(`Connected to the server. Socket id = ${socket.id}`);
    });

    socket.on('connect_error', (err) => {
      setMessage(`Unable to connect to the server: ${err.message}`);
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
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
