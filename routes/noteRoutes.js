const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authmiddleware"); // Changed from auth to authmiddleware
const Note = require("../models/Note");

// Protect all routes with authMiddleware
router.use(authMiddleware);

// Get all notes for logged-in user
router.get("/", async (req, res) => {
  try {
    console.log("📝 Fetching notes for user:", req.user); // Changed from req.userId to req.user
    
    const notes = await Note.find({ userId: req.user }).sort({ createdAt: -1 });
    
    res.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new note
router.post("/", async (req, res) => {
  try {
    const { title, content } = req.body;

    console.log("📝 Creating note for user:", req.user);

    const note = await Note.create({
      userId: req.user, // Changed from req.userId to req.user
      title,
      content,
    });

    res.status(201).json(note);
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update a note
router.put("/:id", async (req, res) => {
  try {
    const { title, content } = req.body;

    const note = await Note.findOne({ _id: req.params.id, userId: req.user });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    note.title = title || note.title;
    note.content = content || note.content;

    await note.save();

    res.json(note);
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a note
router.delete("/:id", async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user 
    });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;