import http from 'http';
import { Server as IOServer } from 'socket.io';
import app from './app.js';

const port = Number(process.env.PORT ?? 4000);
const server = http.createServer(app);

const io = new IOServer(server, {
    cors: {
        origin: [process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000', process.env.DEV_FRONTEND_ORIGIN ?? 'http://localhost:3001'],
        methods: ['GET', 'POST'],
    },
});

// expose io via app settings so controllers can emit events
app.set('io', io);

io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
    });
});

server.listen(port, () => console.log(`Backend running on port ${port}`));
