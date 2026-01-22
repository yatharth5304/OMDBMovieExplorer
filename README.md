🎬 OMDB Movie Explorer



A full-stack OMDB Movie Explorer application that allows users to search movies, view detailed information, and manage a favorites list.

The application follows clean REST principles, uses caching for performance, and provides a simple, interactive UI.



📌 Features

🔍 Movie Search



Search movies and series by title



Displays posters, titles, and release years



Keyboard support (press Enter to search)



🎞 Movie Details



Click any movie card to view detailed information



Details include:



Plot



Director



Actors



Release year



Displayed in a modal overlay for better UX



⭐ Favorites



Add movies to favorites



Remove movies from favorites



Favorites persist using PostgreSQL



Clicking a favorite opens movie details



⚡ Performance



In-memory caching using Caffeine



Reduces repeated external OMDB API calls



Configurable cache size and expiry



🏗 Architecture Overview

Frontend (HTML, CSS, JavaScript)

&nbsp;       ↓

Spring Boot REST API

&nbsp;       ↓

Caffeine Cache

&nbsp;       ↓

OMDB Public API



Favorites

&nbsp;       ↓

PostgreSQL Database



🧰 Tech Stack

Backend



Java 21



Spring Boot



Spring Web



Spring Data JPA



Caffeine Cache



PostgreSQL



Frontend



HTML



CSS



Vanilla JavaScript (no frameworks)



Tools



Maven



Postman (API testing)



Git \& GitHub



🔐 API Integration



The application integrates with the OMDB API:



https://www.omdbapi.com/





The API key is securely stored in application.properties and is never exposed to the frontend.



🧠 Caching Strategy



Implemented using Caffeine (in-memory cache)



Caches:



Movie search results



Movie detail responses



Cache configuration:



Maximum size limit



Time-based expiration



Improves performance and reduces external API usage



🗄 Database Design (Favorites)



Favorites are stored without login or authentication, as per project scope.



Table: favorites



id (Primary Key)



imdb\_id



title



year



poster



🚀 How to Run Locally

1️⃣ Clone Repository

git clone <your-github-repo-url>

cd omdb-movie-explorer



2️⃣ Configure Database



Create a PostgreSQL database:



CREATE DATABASE omdb;





Update application.properties:



spring.datasource.url=jdbc:postgresql://localhost:5432/omdb

spring.datasource.username=postgres

spring.datasource.password=YOUR\_PASSWORD



3️⃣ Add OMDB API Key

omdb.api.key=YOUR\_OMDB\_API\_KEY



4️⃣ Run Backend

mvn spring-boot:run



5️⃣ Open Frontend

http://localhost:8080/index.html



🧪 API Endpoints

Search Movies

GET /api/search?title=batman



Movie Details

GET /api/movie/{imdbId}



Favorites

POST   /api/favorites

GET    /api/favorites

DELETE /api/favorites/{id}



🧪 Testing



APIs tested using Postman



UI tested manually in browser



Cache behavior verified via backend logs



🎯 Design Decisions



No login/authentication: Not required by specification



Vanilla JS frontend: Simple, easy to explain, interview-friendly



In-memory caching: Suitable for local and single-instance deployment



Modal-based details view: Avoids routing complexity



📈 Possible Enhancements



User authentication



User-specific favorites



Pagination for search results



Redis for distributed caching



Responsive enhancements



👤 Author



Yatharth Maharwade

Built as part of a full-stack development task using Spring Boot and JavaScript.



📄 License



This project is for educational and evaluation purposes.

