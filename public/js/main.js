const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName =  document.getElementById('room-name');
const msgInput = document.querySelector('#msg');
const userList =  document.getElementById('users');
const activity =  document.querySelector('#activity');

const { username , room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

console.log('username', username);

// Join chatroom
socket.emit('joinRoom', {username, room});

// Get room and users
socket.on('roomusers', ({room, users}) => {
    outputRoomName(room);
    console.log('users', users);
    outputUsers(users);  
})

socket.on('message', message => {
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('TypingActivity', (username) => {
    activity.innerHTML = `${username} is typing...`;
    document.querySelector('.chat-messages').appendChild(activity);
});

chatForm.addEventListener('submit', e => {
    e.preventDefault();
    const msg = e.target.elements.msg.value;
    socket.emit('chatMessage', msg);
    // Clear messages
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();

});

// Output message to DOM
function outputMessage(message) {
   const div = document.createElement('div');
   activity.innerHTML = '';
   div.classList.add('message');
   div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
   <p class="text">
       ${message.textmsg}
   </p>`;
   document.querySelector('.chat-messages').appendChild(div);
}

function outputRoomName(room) {
    roomName.innerText = room;
}

function outputUsers(users) {
    userList.innerHTML = `
      ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}

msgInput.addEventListener('keypress', () => {
   socket.emit('typing', socket.id);
});