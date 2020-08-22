const path = require('path')
const http = require('http')
const express = require('express')
const sockerio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = sockerio(server)

const formatMessage = require('./utils/message')
const { joinUser, selectUser, userLeave, getRoomUsers } = require('./utils/users')

//Set static folder
app.use(express.static(path.join(__dirname, 'public')))

//Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = joinUser(socket.id, username, room)

    socket.join(user.room)

    socket.emit('message', formatMessage('Chatbot', `Welcome to ${room} chat room, ${username}`))
  
    socket.broadcast
      .to(user.room)
      .emit('message', formatMessage('Chatbot', `${username} has joined the chat`))

    //Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    })
  })

  socket.on('disconnect', () => {
    const user = userLeave(socket.id)
    
    if (user) {
      io.to(user.room).emit(
        'message', 
        formatMessage('Chatbot', `${user.username} has left the chat`)
      )
      //Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      })
    }
  })

  socket.on('chatMessage', (msg) => {
    const user = selectUser(socket.id)

    io.to(user.room).emit('message', formatMessage(user.username, msg))
  })
})

const PORT = 3000 || process.env.PORT

server.listen(PORT, () => console.log(`server running on port ${PORT}`))