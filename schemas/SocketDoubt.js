const mongoose = require("mongoose");
const { Schema } = mongoose;

const doubtSchema = new Schema(
  {
    socket: Schema.Types.Mixed,
    username: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: "socket_doubt",
  }
);

module.exports = mongoose.model("SocketDoubt", doubtSchema);
