# Student Management System

A lightweight, single-page Student Management System built with plain HTML, CSS, and JavaScript. No backend, database, or build step required — data is saved in the browser via `localStorage`.

## Features
- Add, edit, and delete student records
- Fields: name, roll number, class/grade, email, phone, attendance %, notes
- Live search by name, roll number, or class
- Sort by name, roll number, class, or attendance
- Duplicate roll number prevention
- Attendance status pills (good / warning / low)
- Fully responsive layout

## Running it locally
Just open `index.html` in any browser — no server or install needed.

```bash
open index.html      # macOS
start index.html      # Windows
```

## Project structure
```
student-management-system/
├── index.html   # Page structure
├── style.css    # Styling
├── script.js    # CRUD logic + localStorage persistence
└── README.md
```

## Uploading to GitHub
From inside the `student-management-system` folder, run:

```bash
git init
git add .
git commit -m "Initial commit: student management system"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

If you haven't created the repo yet, create an empty one first at https://github.com/new (don't initialize it with a README), then run the commands above.

## Notes
- Data is stored per-browser via `localStorage`. Clearing browser data will remove it.
- To move to a real database/backend later, swap the storage functions in `script.js` for API calls.
