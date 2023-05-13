const express = require("express");
const mongoose = require("mongoose");
const app = express();
const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");
const Doubt = require("./schemas/Doubt");
const SocketDoubt = require("./schemas/SocketDoubt");
const server = http.createServer(app);
const { Server } = require("socket.io");
// const Lecture = require("./schemas/Lecture");

// var corsOptions = {
//   origin: "https://jade-selkie-bc6ac8.netlify.app",
//   optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
// };
var corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(bodyParser.json());
app.use(cors(corsOptions));

const uri =
  "mongodb+srv://aashish:Gk3yc90TAhbPsm0H@cluster0.zr7ivx7.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(uri, { useNewUrlParser: true }).then(() => {
  console.log("Mongo DB connected");
});

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const randomId = function (length = 6) {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
};

// io.use(() => {
//   console.log("temp");
// });

io.use(async (socket, next) => {
  console.log(socket);
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

  // console.log("before old");
  const old = await SocketDoubt.findOne({ username: username });
  // console.log(old);
  if (old) {
    socket.sessionID = old.sessionId;
    socket.userID = old.userId;
  } else {
    // create new session
    socket.sessionID = randomId();
    socket.userID = randomId();
    // await SocketDoubt.create({ socket, username });
    const sockDoubt = new SocketDoubt({
      userId: socket.userID,
      sessionId: socket.sessionID,
      username,
    });
    await sockDoubt.save();
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
    const { doubt } = req.body;
    // if (!doubt || !session) {
    //   console.log(session, doubt);
    //   return res.status(301).json({
    //     success: false,
    //     error: "Doubt and session object not passed",
    //   });
    // }

    // const d = await Doubt.create({
    //   user: session.userID,
    //   session: session.sessionID,
    //   course: doubt.course,
    //   question: doubt.question,
    //   lecture: doubt.lecture,
    // });

    socket.emit("doubt", doubt);
    socket.broadcast.emit("new doubt");

    return res.json(d);
  });
}); // we are looking for an event by this name

app.get("/api/doubt", async (req, res) => {
  try {
    const { course, lecture } = req.query;
    const doubts = await Doubt.find({ course, lecture });
    // console.log(doubts);
    return res.status(200).json({
      success: true,
      data: doubts,
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/api/lecture", async (req, res) => {
  try {
    const myDb = mongoose.connection.useDb("mongoproject");
    const lectures = await myDb.db.collection("lecture").find({}).toArray();
    // console.log(doubts);
    return res.status(200).json({
      success: true,
      data: lectures,
    });
  } catch (err) {
    console.log(err);
  }
});

// this function should be executed when the server is started.
server.listen(8080, () => console.log("Server started at port 8080"));
