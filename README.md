# School Management Portal

A modern, fast, and fully-featured school management system built using React (Frontend) and FastAPI (Backend) with MongoDB.

## Technologies used

### Frontend

- **React** & **React DOM** — UI
- **TypeScript** — typed JavaScript
- **Vite** — dev server and production build
- **React Router** — client-side routing
- **Tailwind CSS** (v4, `@tailwindcss/vite`) — styling
- **Axios** — HTTP client to the FastAPI backend
- **UI & UX** — shadcn 


### Backend

- **Python** — runtime
- **FastAPI** — HTTP API framework
- **Uvicorn** — ASGI server
- **Motor** & **PyMongo** + **dnspython** — async/sync MongoDB access
- **Pydantic** & **pydantic-settings** — request/response models and settings
- **python-jose** (cryptography) — JWT tokens
- **bcrypt** — password hashing
- **python-multipart** — form uploads

### Database & auth

- **MongoDB** — primary data store (users, classes, students, teachers, timetable, attendance, marks, exams, school settings)
- **JWT** — session tokens after login; role-based access (admin, teacher, student)

### Development tooling

- **Bun** or **npm** — install scripts and local dev (`bun run dev` / `npm run dev`)
- **pip** + **`requirements.txt`** — Python dependencies


## 🚀 How to Run the Project

This project requires two terminals to run simultaneously: one for the React frontend and one for the FastAPI backend.

### 1. Start the Backend (FastAPI)

From the **project root**, open a terminal, **change into the `backend` folder first**, then start Uvicorn. The app module path (`app.main:app`) only works when your current directory is `backend`.

```bash
cd backend

# Install dependencies (only needed once)
pip install -r requirements.txt

# Run the Python API server (must be run from inside backend/)
uvicorn app.main:app --reload
```

The backend will be available at http://localhost:8000

### 2. Start the Frontend (React + Vite)
Open a **second** terminal and stay in the root project directory.

```bash
# Install dependencies (only needed once)
bun install  # or npm install

# Start the frontend
bun run dev  # or npm run dev
```
*The frontend will launch and generally be available at http://localhost:5173*

---

## 📂 Project Structure Explained

The project is split cleanly into two distinct parts:

### `/backend` (Python + FastAPI)
Contains all the database logic, security authentication, and API endpoints.

- `/backend/app/main.py`: The entry point for the backend server.
- `/backend/app/routers/`: Contains all our API routes grouped logically (e.g., `admin.py`, `auth.py`). 
- `/backend/app/schemas.py`: Defines entirely typing and data validation schemas (Pydantic models) used for database transactions. 
- `/backend/app/deps.py`: Contains dependencies like database connections and authentication gates. 
- `/backend/scripts/seed.py`: A very useful script that lets you erase and populate the database with dummy students and teachers instantly. Run `python scripts/seed.py` from within the backend folder.

### `/src` (React + TypeScript + Tailwind)
Contains the beautiful User Interface for admins, teachers, and students.

- `/src/pages/`: All the main pages of the application (e.g., `Login.tsx`, `Dashboard.tsx`, `AdminTeachers.tsx`, `Timetable.tsx`). These correlate directly with the routes the user sees.
- `/src/components/`: Re-usable building blocks and layout pieces, like the top `PortalHeader.tsx`.
- `/src/lib/api.ts`: A centralized file that handles talking to the backend (Axios config), so elements like login-tokens are handled automatically.
- `index.css`: Where global Tailwind CSS imports exist.

## 🔐 Authentication
When logging in, the frontend sends a request to the backend `auth` endpoints. It safely uses JWT tokens to prove who you are with every subsequent request. Admin accounts have different access levels compared to Teacher or Student accounts. 
