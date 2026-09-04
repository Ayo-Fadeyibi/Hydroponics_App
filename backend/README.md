# Backend Setup Guide

This guide explains how to set up the backend environment, install dependencies, and run the FastAPI development server.

---

## 1. Create and Activate a Virtual Environment

Note: You don't need to create the virtual environment everytime, but you need to activate it before running the server.

### macOS / Linux

```sh
python -m venv .venv
source .venv/bin/activate
```

### Windows (PowerShell)

```sh
python -m venv .venv
.venv\Scripts\Activate
```

When activated, your terminal prompt should look like:

```sh
(.venv)
```

If it's messing other stuff up, I would recommend deactivating it after the session too.

```sh
deactivate
```

---

## 2. Install dependencies

All required Python packages are listed in requirements.txt, install them by:

```sh
pip install -r requirements.txt
```

---

## 3. Run FastAPI Development Server

Run:

```sh
fastapi dev
```

---

## 4. Access the API

Once it is running, open the API Root:

Run:

```sh
http://localhost:8000
```

### Access the API docs (Swagger UI)

```sh
http://localhost:8000/docs
# or
http://localhost:8000/redoc
```

---

## 👨‍💻 (DEVELOPER NOTE:) When installing, upgrading or removing packages -> update the dependency list:

Run the following which will update the requirements.txt file to commit the updated files so everything stays in sync.

```sh
pip freeze > requirements.txt
```
