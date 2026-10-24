
const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
const PORT = 3000;

const db = new Database("notes.db");

app.use(cors());
app.use(express.json());

// Create the notes table automatically
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    tags TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// Check that the backend is running
app.get("/", (req, res) => {
  res.json({ message: "Notes Board API is running!" });
});

// Get all notes, with optional search
app.get("/api/notes", (req, res) => {
  const search = req.query.q || "";
  const notes = db.prepare(`
    SELECT * FROM notes
    WHERE title LIKE ? OR content LIKE ? OR tags LIKE ?
    ORDER BY id DESC
  `).all(`%${search}%`, `%${search}%`, `%${search}%`);

  res.json(notes);
});

// Create a note
app.post("/api/notes", (req, res) => {
  const { title, content = "", tags = "" } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Title is required" });
  }

  const result = db.prepare(`
    INSERT INTO notes (title, content, tags)
    VALUES (?, ?, ?)
  `).run(title.trim(), content, tags);

  const note = db.prepare("SELECT * FROM notes WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json(note);
});

// Edit a note
app.put("/api/notes/:id", (req, res) => {
  const { title, content = "", tags = "" } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Title is required" });
  }

  const result = db.prepare(`
    UPDATE notes
    SET title = ?, content = ?, tags = ?
    WHERE id = ?
  `).run(title.trim(), content, tags, req.params.id);

  if (!result.changes) {
    return res.status(404).json({ error: "Note not found" });
  }

  res.json(
    db.prepare("SELECT * FROM notes WHERE id = ?").get(req.params.id)
  );
});

// Delete a note
app.delete("/api/notes/:id", (req, res) => {
  const result = db.prepare("DELETE FROM notes WHERE id = ?")
    .run(req.params.id);

  if (!result.changes) {
    return res.status(404).json({ error: "Note not found" });
  }

  res.json({ message: "Note deleted successfully" });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
