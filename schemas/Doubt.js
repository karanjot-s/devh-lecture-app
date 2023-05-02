const mongoose = require("mongoose");
const { Schema } = mongoose;

const doubtSchema = new Schema(
  {
    user: {
      type: String,
      required: true,
    },
    lecture: { type: String, required: true },
    course: { type: String, required: true },
    question: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: "doubt",
  }
);

module.exports = mongoose.model("Doubt", doubtSchema);
