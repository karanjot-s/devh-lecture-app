const mongoose = require("mongoose");
const { Schema } = mongoose;

const doubtSchema = new Schema(
  {
    userId: { type: String, required: true },
    sessionId: { type: String, required: true },
    username: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: "socket_doubt",
  }
);

module.exports = mongoose.model("SocketDoubt", doubtSchema);
