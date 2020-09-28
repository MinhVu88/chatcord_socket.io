const path = require("path"),
  http = require("http"),
  express = require("express"),
  socketio = require("socket.io"),
  app = express(),
  server = http.createServer(app),
  io = socketio(server),
  port = process.env.PORT || 3000,
  formatMessages = require("./utils/formattedMessages"),
  {
    getJoinedUser,
    getCurrentUser,
    getDisconnectedUser,
    getUsersInARoom
  } = require("./utils/users");

app.use(express.static(path.join(__dirname, "public")));

// this runs when a client/browser connects to the server &
// thus signifies a "connection" event between the server & clients
io.on("connection", socket => {
  console.log(`a new websocket connection: ${socket.id}`);

  const userId = socket.id;

  socket.on("joinRoom", ({ username, room }) => {
    const user = getJoinedUser(userId, username, room),
      roomInUse = user.room;

    console.log("currently active room:", roomInUse);

    socket.join(roomInUse);

    // this emits messages from the server to a single client
    // that's connecting directly to the server at the moment
    socket.emit(
      "message",
      formatMessages(username, `Welcome to the ${roomInUse} chatroom`)
    );

    // this emits messages from the server to every client,
    // except the one that's connecting directly to the server at the moment
    // io.emit() -> this emits messages from the server to all the clients generally
    socket.broadcast
      .to(roomInUse)
      .emit(
        "message",
        formatMessages(username, `${user.username} has joined the chat`)
      );

    // this emits connected users & room info from the server to the client,
    // which renders the info accordingly
    io.to(roomInUse).emit("roomAndUsers", {
      currentRoom: roomInUse,
      currentUsers: getUsersInARoom(roomInUse)
    });
  });

  // listen for chatMsg from the client
  socket.on("chatMsg", msg => {
    const currentUser = getCurrentUser(userId);

    io.to(currentUser.room).emit(
      "message",
      formatMessages(currentUser.username, msg)
    );
  });

  // this runs when a client disconnects from the server (a "disconnect" event)
  // this event must be defined inside the connection event
  socket.on("disconnect", () => {
    const removedUser = getDisconnectedUser(userId);

    if (removedUser) {
      io.to(removedUser.room).emit(
        "message",
        formatMessages(
          removedUser.username,
          `${removedUser.username} has left the chat`
        )
      );

      // this emits disconnected users & room info from the server to the client,
      // which renders the info accordingly
      io.to(removedUser.room).emit("roomAndUsers", {
        currentRoom: removedUser.room,
        currentUsers: getUsersInARoom(removedUser.room)
      });
    }
  });
});

server.listen(port, () => console.log(`server's listening on port ${port}`));
