const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { getCurrentUser, userJoin, leaveRoom, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const appName = 'ChatApp';

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {

    socket.on('joinRoom', userDetails => {
        const user = userJoin(socket.id, userDetails.username, userDetails.room);
        socket.join(userDetails.room);

        socket.emit('message', formatMessage(appName , 'Welcome to Chat App!')); // - Emits to the single client

        // Broadcast when user conencts - Emits all the user except who is connecting
        socket.broadcast.to(userDetails.room).emit('message', formatMessage(appName, `${userDetails.username} has joined the chat`));

         // Send users and room info
         io.to(user.room).emit('roomusers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // For chat messages
    socket.on('chatMessage', (msg) => {
        const currentUser = getCurrentUser(socket.id);
        console.log('getCurrentUser: ', currentUser);
        io.to(currentUser.room).emit('message', formatMessage(currentUser.username, msg));
    });

    // Typing
    socket.on('typing', (userId) => {
        const user = getCurrentUser(userId);
        if(user) {
            socket.broadcast.to(user.room).emit('TypingActivity', user.username);
        }
    });

    // Disconnect
    socket.on('disconnect', () => {
        const user = leaveRoom(socket.id);
        if(user) {
            io.to(user.room).emit('message', formatMessage(appName, `${user.username} has left the chat`));

             // Send users and room info
            io.to(user.room).emit('roomusers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
    
});

server.listen(3000, () => { console.log('Listening on port 3000') });