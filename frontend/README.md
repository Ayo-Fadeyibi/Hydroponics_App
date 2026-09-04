# Frontend Setup Guide

This guide explains how to install dependencies and run the React + Vite development server.

---

## 1. Install Node.js

Make sure you have Node.js installed (version 18+ recommended).

Check your version:

```sh
cd frontend
node -v
npm -v
```

## 2. Install Dependencies and Run

```sh
npm install
npm run dev
```

Frontend is now running at:

```
http://localhost:5173
```

> The Vite proxy automatically forwards `/api/*` requests from the frontend to the backend at `localhost:8000`. No extra configuration needed.
