const chatForm = document.getElementById("chat-form")
const chatMessages = document.querySelector(".chat-messages")
const roomName = document.querySelector(".room-name")
const userList = document.querySelector(".chat-users")

const socket = io()

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
})

socket.emit('joinRoom', { username, room })

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room)
  outputUsers(users)
})

socket.on('message', message => {
  console.log(message)
  chatMessages.scrollTop = chatMessages.scrollHeight
  outputMessage(message)
  }
)

chatForm.addEventListener("submit", (e) => {
  e.preventDefault()
  const msg = e.target.elements.msg.value
  socket.emit('chatMessage', msg)
  e.target.elements.msg.value = ""
  e.target.elements.msg.focus()
})

const outputMessage = (msg) => {
  const div = document.createElement("div")
  div.classList.add("message")
  div.innerHTML = `
    <p class="meta">${msg.username} <span>${msg.time}</span></p>
    <p class="text">${msg.message}</p>
  `
  chatMessages.appendChild(div)
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room
}

// Add users to room
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
  `
}