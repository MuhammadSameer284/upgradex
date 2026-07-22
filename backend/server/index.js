import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import codeReviewRoutes from './routes/codeReviewRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import videoCallRoutes from './routes/videoCallRoutes.js';
import cors from 'cors';

dotenv.config();

connectDB();

const app = express();

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reviews", codeReviewRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use('/api/calls', videoCallRoutes);

import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = process.env.PORT || 3000;

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ["GET", "POST"],
        credentials: true
    }
});

const hostMap = new Map(); // roomID -> socket.id

io.on('connection', (socket) => {
    // When a user wants to join a room
    socket.on('request join', (payload) => {
        const { roomID, role, name, initials, bg } = payload;
        
        if (role === 'instructor') {
            // Instructor bypasses waiting room
            hostMap.set(roomID, socket.id);
            socket.join(roomID);
            
            // Notify any waiting students that the host has arrived
            io.to(`${roomID}-waiting`).emit('host arrived');
            
            const usersInRoom = [];
            const room = io.sockets.adapter.rooms.get(roomID);
            if (room) {
                for (const clientId of room) {
                    if (clientId !== socket.id) usersInRoom.push(clientId);
                }
            }
            socket.emit('all users', usersInRoom);
        } else {
            // Student must wait for admission
            const hostSocketId = hostMap.get(roomID);
            if (hostSocketId) {
                // Send request to host
                io.to(hostSocketId).emit('admission request', {
                    studentId: socket.id,
                    name,
                    initials,
                    bg
                });
            } else {
                // Host is not here yet, student joins waiting room channel
                socket.join(`${roomID}-waiting`);
                socket.emit('host missing');
            }
        }
    });

    // Host approves a student
    socket.on('approve join', (payload) => {
        const { studentId, roomID } = payload;
        // The student socket needs to join the room
        const studentSocket = io.sockets.sockets.get(studentId);
        if (studentSocket) {
            studentSocket.leave(`${roomID}-waiting`); // Leave waiting channel
            studentSocket.join(roomID);
            studentSocket.emit('admission approved');
            
            // Now tell the student who else is in the room so they can P2P
            const usersInRoom = [];
            const room = io.sockets.adapter.rooms.get(roomID);
            if (room) {
                for (const clientId of room) {
                    if (clientId !== studentId) usersInRoom.push(clientId);
                }
            }
            studentSocket.emit('all users', usersInRoom);
        }
    });

    // Host denies a student
    socket.on('deny join', (payload) => {
        const { studentId } = payload;
        io.to(studentId).emit('admission denied');
    });
    socket.on('sending signal', payload => {
        // payload: { userToSignal, callerID, signal, ...callerInfo }
        io.to(payload.userToSignal).emit('user joined', {
            signal: payload.signal,
            callerID: payload.callerID,
            callerName: payload.callerName,
            callerInitials: payload.callerInitials,
            callerBg: payload.callerBg,
            callerRole: payload.callerRole,
            callerUserId: payload.callerUserId
        });
    });

    // WebRTC Signaling: Returning an answer/ICE candidate
    socket.on('returning signal', payload => {
        io.to(payload.callerID).emit('receiving returned signal', {
            signal: payload.signal,
            id: socket.id,
            responderName: payload.responderName,
            responderInitials: payload.responderInitials,
            responderBg: payload.responderBg,
            responderRole: payload.responderRole,
            responderUserId: payload.responderUserId
        });
    });

    // Chat Messages — frontend emits the full message object as the payload
    socket.on('send message', payload => {
        // Broadcast to everyone in the room except sender
        // The payload IS the message object (has roomID, text, sender, etc.)
        const { roomID, ...message } = payload;
        socket.to(roomID).emit('new message', message);
    });
    
    // Toggle Media state
    socket.on('toggle media', payload => {
        socket.to(payload.roomID).emit('user toggled media', {
            id: socket.id,
            micOn: payload.micOn,
            camOn: payload.camOn
        });
    });

    // Toggle Screen Share
    socket.on('screen share toggle', payload => {
        socket.to(payload.roomID).emit('user toggled screen share', {
            id: socket.id,
            isScreenSharing: payload.isScreenSharing
        });
    });

    // Raise Hand
    socket.on('raise hand', payload => {
        socket.to(payload.roomID).emit('user raised hand', {
            id: socket.id,
            handRaised: payload.handRaised
        });
    });

    // Typing indicator
    socket.on('typing', payload => {
        socket.to(payload.roomID).emit('user typing', {
            id: socket.id,
            name: payload.name,
            isTyping: payload.isTyping
        });
    });

    socket.on('end call', payload => {
        socket.to(payload.roomID).emit('call ended');
    });

    socket.on('disconnect', () => {
        // Remove from hostMap if host is disconnecting
        for (const [roomID, hostId] of hostMap.entries()) {
            if (hostId === socket.id) {
                hostMap.delete(roomID);
                break;
            }
        }
        // Clear typing indicator if they were typing
        socket.broadcast.emit('user typing', { id: socket.id, name: '', isTyping: false });
        // Broadcast disconnection so clients can remove the peer
        socket.broadcast.emit('user left', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server is live at http://localhost:${PORT}`);
});