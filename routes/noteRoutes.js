const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authmiddleware");
const cache = require("../middleware/cache");              // ← ADD
const { redisClient } = require("../config/redis");       // ← ADD
const Note = require("../models/Note");

router.use(authMiddleware);

// GET - add cache(60)
router.get("/", cache(60), async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - clear cache after creating
router.post("/", async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = await Note.create({ userId: req.user, title, content });

    await redisClient.del(`${req.user}:/api/notes`);      // ← ADD

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT - clear cache after updating
router.put("/:id", async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = await Note.findOne({ _id: req.params.id, userId: req.user });
    if (!note) return res.status(404).json({ error: "Note not found" });

    note.title = title || note.title;
    note.content = content || note.content;
    await note.save();

    await redisClient.del(`${req.user}:/api/notes`);      // ← ADD

    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - clear cache after deleting
router.delete("/:id", async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user });
    if (!note) return res.status(404).json({ error: "Note not found" });

    await redisClient.del(`${req.user}:/api/notes`);      // ← ADD

    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;