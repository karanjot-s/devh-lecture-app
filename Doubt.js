const { MongoClient } = require("mongodb");
const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");

app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000,http://localhost:8081",
  },
});

const uri =
  "mongodb+srv://aashish:Gk3yc90TAhbPsm0H@cluster0.zr7ivx7.mongodb.net/?retryWrites=true&w=majority";

// create a collection socket_doubt.

const client = new MongoClient(uri);
client.connect();

io.on("connection", (socket) => {
  console.log("this user is connected " + socket.id);

  client.collection("socket_doubt").insertOne({
    user: socket.user_id,
    socket: socket,
    user_email: socket.user_email,
  });

  app.post("/emit", (req, res) => {
    console.log("this is object received from sboot " + req);

    // getting the users objectId.
    // const doubtBy = req.
  });

  socket.on("disconnect", (socket) => {
    client
      .collection("socket_doubt")
      .updateOne({ user: socket.user_id }, { socket: null });
  });
});

// just to test the connection
app.post("/testing", (req, res) => {
  console.log(req.body.map);
  console.log("testing complete");
});

server.listen(8001);
