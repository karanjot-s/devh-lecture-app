const mongoose = require("mongoose");
const { Schema } = mongoose;

const lectureTypeSchema = new Schema(
  {
    type: { type: String, required: true },
    _class: { type: String, required: true },
  },
  {
    collection: "lecturetype",
  }
);
const lectureSchema = new Schema(
  {
    lectureNumber: { type: Number, required: true },
    lectureLink: { type: String, required: true },
    lectureTitle: { type: String, required: true },
    lectureDescription: { type: String, required: true },
    isPrivate: { type: Boolean, required: true },
    lectureType: { type: lectureTypeSchema, required: true },
  },
  {
    collection: "lecture",
  }
);

module.exports = mongoose.model("Lecture", lectureSchema);
