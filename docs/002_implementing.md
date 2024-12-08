# 002 Implementing

## Technical notes

### Cli

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
