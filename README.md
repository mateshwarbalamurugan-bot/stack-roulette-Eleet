# Stack Roulette Hackathon 2026 - EleeT Squad

## About
EleeT Squad's Notes Board lets users create, search, edit, and delete notes.

## Features
- Create notes with titles, content, and tags
- Search saved notes
- Edit and delete notes
- Store notes in SQLite

## Tech Stack
- Frontend: Vue.js and Vite
- Backend: Node.js and Express.js
- Database: SQLite using better-sqlite3

## Run the Application

### Backend
Open a terminal in the project root:
```powershell
cd backend
npm install
npm start
```

### Frontend
Open a second terminal in the project root:
```powershell
cd frontend
npm install
npm run dev
```

## API Endpoints
- GET / - Check backend status
- GET /api/notes - List and search notes
- POST /api/notes - Create a note
- PUT /api/notes/:id - Edit a note
- DELETE /api/notes/:id - Delete a note

## Project Structure
- frontend/ - Vue application
- backend/ - API and database
- ai_prompt_log.txt - AI prompt record

## Team
EleeT Squad
