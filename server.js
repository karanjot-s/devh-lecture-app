const express = require("express");
const mongoose = require("mongoose");
const app = express();
const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const Doubt = require("./schemas/Doubt");
const SocketDoubt = require("./schemas/SocketDoubt");

app.use(bodyParser.json());
app.use(cors());

const server = http.createServer(app);

const uri =
  "mongodb+srv://aashish:Gk3yc90TAhbPsm0H@cluster0.zr7ivx7.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(uri);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

const randomId = function (length = 6) {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
};

io.use(async (socket, next) => {
  const sessionID = socket.handshake.auth.sessionID;
  if (sessionID) {
    // find existing session
    const session = sessionStore.findSession(sessionID);
    if (session) {
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      socket.username = session.username;
      console.log("true");
    }
  }
  const username = socket.handshake.auth.username;
  if (!username) {
    console.log("false");
    return next();
  }

  const old = await SocketDoubt.findOne({ username: username });

  if (old) {
    socket.sessionID = old.socket.sessionID;
    socket.userID = old.socket.userID;
  } else {
    // create new session
    socket.sessionID = randomId();
    socket.userID = randomId();
    await SocketDoubt.create({ socket, username });
  }
  socket.username = username;
  next();
});

// when theres is a client connection happens. connection signal is emitted.
io.on("connection", (socket) => {
  console.log("user connected" + socket.id);

  socket.emit("session", {
    sessionID: socket.sessionID,
    userID: socket.userID,
  });

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log("user with thsi id " + socket.id + " joined the room " + data);
  });

  socket.broadcast.emit("user_connected", {
    userId: socket.id,
    username: socket.username,
  });
  socket.on("send_message", (data) => {
    console.log("this is the userdata " + JSON.stringify(data));
    socket.to(data.room).emit("receive_message", data);
  });
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });

  app.post("/api/doubt", async (req, res) => {
    if (!req.body)
      return res.status(301).json({
        success: false,
        error: "No body passed",
      });
    const { doubt, session } = req.body;
    if (!doubt || !session)
      return res.status(301).json({
        success: false,
        error: "Doubt and session object not passed",
      });

    const d = await Doubt.create({
      user: session.userID,
      session: session.sessionID,
      course: doubt.course,
      question: doubt.question,
      lecture: doubt.lecture,
    });

    socket.emit("doubt", d);
    socket.broadcast.emit("new doubt");

    return res.json(d);
  });
}); // we are looking for an event by this name

// this function should be executed when the server is started.
server.listen(8080, () => console.log("server running"));
