const socket = io(),
  chatForm = document.querySelector("#chat-form"),
  userInput = document.querySelector("#msg"),
  messages = document.querySelector(".chat-messages"),
  roomName = document.querySelector("#room-name"),
  roomUsers = document.querySelector("#users");

const outputMsg = msg => {
  const div = document.createElement("div");

  div.classList.add("message");

  div.innerHTML = `<p class="meta">${msg.username} <span>${msg.time}</span></p>
                   <p class="text">${msg.message}</p>`;

  messages.appendChild(div);
};

const outputCurrentRoom = current_room => (roomName.innerText = current_room);

const outputCurrentUsers = current_users => {
  roomUsers.innerHTML = `${current_users
    .map(user => `<li>${user.username}</li>`)
    .join("")}`;
};

chatForm.addEventListener("submit", e => {
  e.preventDefault();

  const msg = userInput.value;

  console.log(msg);

  // emit messages from the client to the server
  socket.emit("chatMsg", msg);

  // clear the input field after a message's submitted
  // also automatically focus on it afterwards
  userInput.value = "";
  userInput.focus();
});

// messages emitted from the server
socket.on("message", msg => {
  console.log(msg);

  outputMsg(msg);

  // whenever a message's emitted from server to client, the messages list gets longer
  // the code below makes the scroll bar go down to the bottom of the list
  messages.scrollTop = messages.scrollHeight;
});

// get the username & room from the query string in url
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

console.log(`from the url query string -> user: ${username} - room: ${room}`);

socket.emit("joinRoom", { username, room });

// get the current room & the users in it from the server
socket.on("roomAndUsers", ({ currentRoom, currentUsers }) => {
  outputCurrentRoom(currentRoom);

  outputCurrentUsers(currentUsers);
});
