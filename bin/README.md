# 🎬 OMDB Movie Explorer

A full-stack movie explorer built with **Spring Boot** and **Vanilla JavaScript**. Search any film or series, view detailed information in a modal, and manage a personal saved list — backed by Supabase PostgreSQL and deployed on Render.

---

## ✨ Features

- **Movie Search** — search by title with keyboard support (Enter key)
- **Film Details** — plot, director, cast, runtime, IMDb rating in a modal overlay
- **Saved List** — add/remove favourites, persisted in PostgreSQL
- **Caching** — Caffeine in-memory cache reduces redundant OMDb API calls
- **Toast Notifications** — success and error feedback on every action
- **Skeleton Loaders** — shimmer cards during search for perceived performance
- **Duplicate Prevention** — returns `409 Conflict` if a film is already saved
- **XSS Safe** — all user-facing data set via `textContent`, never `innerHTML`

---

## 🏗 Architecture

```
Browser (HTML + CSS + JS)
        ↓  fetch()
Spring Boot REST API  (/api/*)
        ↓
   Caffeine Cache  ←→  OMDb Public API
        ↓
   Spring Data JPA
        ↓
 Supabase PostgreSQL
```

---

## 🧰 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Java 21 | Runtime |
| Spring Boot 4 | Framework |
| Spring Web MVC | REST API |
| Spring Data JPA | Database ORM |
| Caffeine Cache | In-memory caching |
| PostgreSQL (Supabase) | Persistence |
| HikariCP | Connection pooling |

### Frontend
| Technology | Purpose |
|---|---|
| HTML5 (semantic) | Structure |
| Vanilla CSS | Styling (custom dark theme) |
| Vanilla JavaScript (ES2020) | Logic, no frameworks |
| Playfair Display + DM Sans | Typography (Google Fonts) |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker (multi-stage) | Containerisation |
| Render | Cloud hosting |
| Supabase | Managed PostgreSQL |

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/api/search?title={title}` | Search movies by title | `200` |
| `GET` | `/api/movie/{imdbId}` | Get full movie details | `200` |
| `GET` | `/api/favorites` | List all saved films | `200` |
| `POST` | `/api/favorites` | Save a film | `201 Created`, `409 Conflict` |
| `DELETE` | `/api/favorites/{id}` | Remove a saved film | `204 No Content`, `404 Not Found` |
| `GET` | `/api/health` | Health check (used by Render) | `200` |

All error responses return a structured JSON body:
```json
{
  "timestamp": "2026-05-26T07:30:00Z",
  "status": 409,
  "error": "Movie 'Inception' is already in favorites."
}
```

---

## 🗄 Database Schema

Table: `favorites`

| Column | Type | Notes |
|---|---|---|
| `id` | `BIGSERIAL` | Primary key |
| `imdb_id` | `VARCHAR` | Unique — prevents duplicates |
| `title` | `VARCHAR` | |
| `year` | `VARCHAR` | |
| `poster` | `VARCHAR` | Nullable (some films have no poster) |

> Table is auto-created by Hibernate (`ddl-auto=update`) on first run.

---

## 🧠 Caching Strategy

Caffeine in-memory cache with two named caches:

| Cache | Key | TTL | Max Size |
|---|---|---|---|
| `searchCache` | movie title | 10 minutes | 100 entries |
| `movieCache` | IMDb ID | 10 minutes | 100 entries |

---

## 🚀 Running Locally

### Prerequisites
- Java 21+
- Maven (or use the included `mvnw` wrapper)
- PostgreSQL (local or Supabase)
- An [OMDb API key](https://www.omdbapi.com/apikey.aspx) (free)

### 1 — Clone

```bash
git clone https://github.com/yatharth5304/omdb-movie-explorer.git
cd omdb-movie-explorer
```

### 2 — Set Environment Variables

**PowerShell:**
```powershell
$env:OMDB_API_KEY = "your_omdb_api_key"
$env:DATABASE_URL = "jdbc:postgresql://localhost:5432/omdb"
$env:DB_USER      = "postgres"
$env:DB_PASS      = "your_password"
```

**Or add them to your IDE run configuration.**

### 3 — Run

```bash
./mvnw spring-boot:run
```

### 4 — Open

```
http://localhost:8080
```

---

## ☁️ Deploying to Render + Supabase

### Step 1 — Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Go to **Project Settings → Database → Connection String → JDBC**
3. Copy the JDBC URL — it looks like:
   ```
   jdbc:postgresql://db.xxxxxxxxxxxx.supabase.co:5432/postgres?sslmode=require
   ```

### Step 2 — Deploy on Render

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **New → Web Service**
3. Connect your GitHub repo — Render auto-detects the `Dockerfile`
4. In **Environment** tab, add:

| Key | Value |
|---|---|
| `OMDB_API_KEY` | your OMDb API key |
| `DATABASE_URL` | `jdbc:postgresql://db.<ref>.supabase.co:5432/postgres?sslmode=require` |
| `DB_USER` | `postgres` |
| `DB_PASS` | your Supabase database password |

> `PORT` is injected automatically by Render — do not set it manually.

5. Click **Deploy** — Render builds the Docker image and starts the service.

**Health check path:** `/api/health`

---

## 🔐 Security Notes

- API key and database credentials are **never hardcoded** — loaded from environment variables
- Database password is **not committed** to source control
- Frontend uses `textContent` exclusively for user data — **no XSS risk**
- Docker container runs as a **non-root user**
- All DB connections use **SSL** (`sslmode=require`) on Supabase

---

## 🎨 Design Decisions

| Decision | Reason |
|---|---|
| Vanilla JS (no framework) | Simple, fast, interview-friendly |
| No login/auth | Outside project scope |
| Caffeine (not Redis) | Suitable for single-instance deployment |
| Modal for details | Avoids routing complexity |
| Event delegation | Single listener per container — no memory leaks |
| State cache for search results | Adding to favourites needs no extra network fetch |
| Horizontal scroll for saved list | Distinct visual treatment from search results |

---

## 📈 Possible Enhancements

- User authentication + user-specific saved lists
- Pagination for search results (OMDb returns 10 per page)
- Redis for distributed caching across multiple instances
- Watchlist / watched status tracking
- Movie ratings by user

---

## 👤 Author

**Yatharth Maharwade**
Built as part of a full-stack development task using Spring Boot, PostgreSQL and JavaScript.

---

## 📄 License

For educational and evaluation purposes.
