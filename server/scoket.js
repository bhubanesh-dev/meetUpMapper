// socket.js (optional)
// You can separate the socket setup into its own file and import it in server.js
import { Server } from 'socket.io';
import { handleSocketConnection } from './socket/socketController.js';

export const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });
    handleSocketConnection(io);
};
