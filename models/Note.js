const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    userId: {  // Changed from 'user' to 'userId'
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

// Fixed: mongoose.model (not modelNames)
module.exports = mongoose.model("Note", noteSchema);
