const moviesDiv = document.getElementById("movies");
const favoritesDiv = document.getElementById("favorites");

function searchMovies() {
	const title = document.getElementById("searchInput").value;
	document.getElementById("searchSection").style.display = "block"

	if (!title) {
		alert("Please enter a movie name");
		return;
	}

	fetch(`/api/search?title=${title}`)
		.then(res => res.json())
		.then(data => {
			moviesDiv.innerHTML = "";

			if (!data.Search) {
				moviesDiv.innerHTML = "<p>No results found</p>";
				return;
			}

			data.Search.forEach(movie => {
				moviesDiv.insertAdjacentHTML("beforeend", createMovieCard(movie));
			});

			attachMovieCardEvents();
		})
		.catch(err => console.error(err));
}


function createMovieCard(movie) {
	return `
        <div class="movie-card" data-imdbid="${movie.imdbID}">
            <img src="${movie.Poster !== "N/A" ? movie.Poster : ""}">
            <h4>${movie.Title}</h4>
            <p>${movie.Year}</p>
            <button class="fav-btn">Add to Favorites</button>
        </div>
    `;
}


function loadMovieDetails(imdbId) {
	fetch(`/api/movie/${imdbId}`)
		.then(res => res.json())
		.then(movie => {
			document.getElementById("modalBody").innerHTML = `
                <div style="display:flex; gap:20px;">
                    <img src="${movie.Poster}" style="width:200px;">
                    <div>
                        <h2>${movie.Title} (${movie.Year})</h2>
                        <p><strong>Director:</strong> ${movie.Director}</p>
                        <p><strong>Actors:</strong> ${movie.Actors}</p>
                        <p><strong>Plot:</strong> ${movie.Plot}</p>
                    </div>
                </div>
            `;

			document.getElementById("movieModal").classList.remove("hidden");
		})
		.catch(err => console.error("DETAIL FETCH ERROR", err));
}

function closeModal() {
	document.getElementById("movieModal").classList.add("hidden");
}


function addFavorite(movie) {
	fetch("/api/favorites", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			imdbId: movie.imdbID,
			title: movie.Title,
			year: movie.Year,
			poster: movie.Poster
		})
	}).then(() => loadFavorites());
}

function addFavoriteFromSearch(imdbId) {
	fetch(`/api/movie/${imdbId}`)
		.then(res => res.json())
		.then(movie => {
			addFavorite(movie);
		});
}

function loadFavorites() {
	fetch("/api/favorites")
		.then(res => res.json())
		.then(data => {
			favoritesDiv.innerHTML = "";

			data.forEach(movie => {
				favoritesDiv.insertAdjacentHTML(
					"beforeend",
					`
                    <div class="movie-card" data-imdbid="${movie.imdbId}">
                        <img src="${movie.poster}">
                        <h4>${movie.title}</h4>
                        <p>${movie.year}</p>
                        <button onclick="removeFavorite(${movie.id}, event)">
                            Remove from Favorites
                        </button>
                    </div>
                    `
				);
			});

			attachMovieCardEvents();
		});
}

function removeFavorite(id, event) {
	event.stopPropagation();

	fetch(`/api/favorites/${id}`, {
		method: "DELETE"
	}).then(() => loadFavorites());
}

function attachMovieCardEvents() {
	document.querySelectorAll(".movie-card").forEach(card => {

		card.onclick = () => {
			const imdbId = card.dataset.imdbid;
			loadMovieDetails(imdbId);
		};

		const favBtn = card.querySelector(".fav-btn");
		if (favBtn) {
			favBtn.onclick = (event) => {
				event.stopPropagation();
				const imdbId = card.dataset.imdbid;
				addFavoriteFromSearch(imdbId);
			};
		}
	});
}

function handleSearchKey(event) {
	if (event.key === "Enter") {
		searchMovies();
	}
}


loadFavorites();
