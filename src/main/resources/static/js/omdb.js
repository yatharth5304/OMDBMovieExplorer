// ============================================================
//  OMDB Explorer — Frontend Logic
//  - XSS-safe: no innerHTML with user data (textContent only)
//  - Event delegation on parent containers (no per-card listeners)
//  - State cache: search results stored in memory (no redundant fetch to add favorites)
//  - Skeleton loaders for perceived performance
//  - Toast notifications for all success/error feedback
//  - Escape key + backdrop click to close modal
// ============================================================

// --- Application State ---
const state = {
  searchResults: [],   // cache of current search result objects
};

// --- DOM References ---
const searchInput   = document.getElementById('searchInput');
const searchBtn     = document.getElementById('searchBtn');
const searchSection = document.getElementById('searchSection');
const moviesDiv     = document.getElementById('movies');
const favoritesDiv  = document.getElementById('favorites');
const resultCount   = document.getElementById('resultCount');
const favCount      = document.getElementById('favCount');
const emptyFav      = document.getElementById('emptyFav');
const movieModal    = document.getElementById('movieModal');
const modalBody     = document.getElementById('modalBody');
const toastContainer = document.getElementById('toastContainer');

// ============================================================
//  Utilities
// ============================================================

/**
 * Safely sets text content — never innerHTML with user data.
 * Prevents XSS from any API-returned strings.
 */
function setText(el, value) {
  el.textContent = (value && value !== 'N/A') ? value : '';
}

/** Creates a DOM element with optional class string. */
function make(tag, cls) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  return node;
}

// ============================================================
//  Toast Notifications
// ============================================================

function showToast(message, type = 'info') {
  const toast = make('div', type === 'error' ? 'toast error' : 'toast');
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, 3400);
}

// ============================================================
//  Skeleton Loaders
// ============================================================

function showSkeletons(container, count = 8) {
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const card  = make('div', 'skeleton-card');
    const pulse = make('div', 'skeleton-pulse');
    card.appendChild(pulse);
    container.appendChild(card);
  }
}

// ============================================================
//  Card Builders — pure DOM, no innerHTML interpolation
// ============================================================

function buildMovieCard(movie) {
  const card = make('div', 'movie-card');
  card.dataset.imdbid = movie.imdbID;
  card.setAttribute('role', 'listitem');

  // Poster
  if (movie.Poster && movie.Poster !== 'N/A') {
    const img = make('img');
    img.src = movie.Poster;
    img.alt = '';                       // decorative — title is in overlay
    img.loading = 'lazy';
    card.appendChild(img);
  } else {
    const fallback = make('div', 'poster-fallback');
    fallback.textContent = '🎬';
    card.appendChild(fallback);
  }

  // Overlay
  const overlay = make('div', 'card-overlay');

  const titleEl = make('div', 'card-title');
  setText(titleEl, movie.Title);

  const yearEl = make('div', 'card-year');
  setText(yearEl, movie.Year);

  const saveBtn = make('button', 'card-fav-btn fav-btn');
  saveBtn.textContent = '+ Save';
  saveBtn.setAttribute('aria-label', `Save ${movie.Title} to favourites`);

  overlay.append(titleEl, yearEl, saveBtn);
  card.appendChild(overlay);

  return card;
}

function buildFavCard(movie) {
  const card = make('div', 'fav-card');
  card.dataset.imdbid = movie.imdbId;
  card.dataset.favid  = movie.id;
  card.setAttribute('role', 'listitem');

  // Poster
  if (movie.poster && movie.poster !== 'N/A') {
    const img = make('img');
    img.src = movie.poster;
    img.alt = '';
    img.loading = 'lazy';
    card.appendChild(img);
  } else {
    const fallback = make('div', 'poster-fallback');
    fallback.textContent = '🎬';
    card.appendChild(fallback);
  }

  // Overlay
  const overlay = make('div', 'card-overlay');
  const titleEl = make('div', 'card-title');
  setText(titleEl, movie.title);
  const yearEl  = make('div', 'card-year');
  setText(yearEl, movie.year);
  overlay.append(titleEl, yearEl);
  card.appendChild(overlay);

  // Remove button (SVG icon — not text character)
  const removeBtn = make('button', 'remove-btn');
  removeBtn.setAttribute('aria-label', `Remove ${movie.title} from saved`);
  // Using a literal SVG string here is safe — no user data inside it
  removeBtn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2.8" stroke-linecap="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>`;
  card.appendChild(removeBtn);

  return card;
}

// ============================================================
//  Search
// ============================================================

async function searchMovies() {
  const title = searchInput.value.trim();

  if (!title) {
    showToast('Type a film or series name first.', 'error');
    searchInput.focus();
    return;
  }

  searchSection.classList.remove('hidden');
  showSkeletons(moviesDiv, 8);
  resultCount.textContent = '';

  try {
    const res = await fetch(`/api/search?title=${encodeURIComponent(title)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    moviesDiv.innerHTML = '';
    state.searchResults = [];

    if (!data.Search || !data.Search.length) {
      const msg = make('p', 'empty-state');
      msg.textContent = `No results for "${title}".`;
      moviesDiv.appendChild(msg);
      return;
    }

    state.searchResults = data.Search;

    data.Search.forEach(movie => {
      moviesDiv.appendChild(buildMovieCard(movie));
    });

    resultCount.textContent = `${data.Search.length} titles`;

  } catch (err) {
    moviesDiv.innerHTML = '';
    const msg = make('p', 'empty-state');
    msg.textContent = 'Could not load results. Please try again.';
    moviesDiv.appendChild(msg);
    showToast('Search failed — check your connection.', 'error');
    console.error('[Search]', err);
  }
}

// ============================================================
//  Favorites — Load
// ============================================================

async function loadFavorites() {
  try {
    const res = await fetch('/api/favorites');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    favoritesDiv.innerHTML = '';

    if (!data.length) {
      emptyFav.style.display = 'block';
      favCount.textContent = '';
    } else {
      emptyFav.style.display = 'none';
      data.forEach(movie => favoritesDiv.appendChild(buildFavCard(movie)));
      favCount.textContent = `${data.length} saved`;
    }

  } catch (err) {
    console.error('[Favorites]', err);
    showToast('Could not load saved films.', 'error');
  }
}

// ============================================================
//  Favorites — Add
//  Uses the state cache — NO extra network fetch needed.
//  The search results already contain imdbId, title, year, poster.
// ============================================================

async function addFavorite(imdbId, btnEl) {
  const movie = state.searchResults.find(m => m.imdbID === imdbId);
  if (!movie) return;

  btnEl.disabled = true;
  btnEl.textContent = 'Saving…';

  try {
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imdbId: movie.imdbID,
        title:  movie.Title,
        year:   movie.Year,
        poster: movie.Poster !== 'N/A' ? movie.Poster : null,
      }),
    });

    if (res.status === 409) {
      btnEl.textContent = '✓ Saved';
      showToast(`"${movie.Title}" is already in your list.`, 'error');
      return;
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    btnEl.textContent = '✓ Saved';
    showToast(`"${movie.Title}" added to your list.`);
    await loadFavorites();

  } catch (err) {
    btnEl.disabled = false;
    btnEl.textContent = '+ Save';
    showToast('Could not save. Try again.', 'error');
    console.error('[AddFavorite]', err);
  }
}

// ============================================================
//  Favorites — Remove
// ============================================================

async function removeFavorite(favId, cardEl) {
  // Optimistic UI: fade out while request is in flight
  cardEl.style.transition = 'opacity 0.2s';
  cardEl.style.opacity = '0.35';
  cardEl.style.pointerEvents = 'none';

  try {
    const res = await fetch(`/api/favorites/${favId}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 404) throw new Error(`HTTP ${res.status}`);
    await loadFavorites();

  } catch (err) {
    cardEl.style.opacity = '';
    cardEl.style.pointerEvents = '';
    showToast('Could not remove. Try again.', 'error');
    console.error('[RemoveFavorite]', err);
  }
}

// ============================================================
//  Movie Detail Modal
// ============================================================

async function openModal(imdbId) {
  movieModal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Show loading state immediately
  const loading = make('div', 'modal-loading');
  loading.textContent = 'Loading…';
  modalBody.innerHTML = '';
  modalBody.appendChild(loading);

  try {
    const res = await fetch(`/api/movie/${encodeURIComponent(imdbId)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const movie = await res.json();

    const detail = make('div', 'modal-detail');

    // --- Poster ---
    const posterWrap = make('div', 'modal-poster');
    if (movie.Poster && movie.Poster !== 'N/A') {
      const img = make('img');
      img.src = movie.Poster;
      img.alt = '';
      posterWrap.appendChild(img);
    } else {
      const fallback = make('div', 'modal-poster-fallback');
      fallback.textContent = '🎬';
      posterWrap.appendChild(fallback);
    }

    // --- Info panel ---
    const info = make('div', 'modal-info');

    const titleEl = make('h2', 'modal-title');
    titleEl.id = 'modalTitle';
    setText(titleEl, movie.Title);

    // Genre + Year row
    const genreRow = make('div', 'modal-genre');
    const yearSpan = make('span');
    setText(yearSpan, movie.Year);
    genreRow.appendChild(yearSpan);

    if (movie.Genre && movie.Genre !== 'N/A') {
      const dot = make('span', 'dot');
      const genreSpan = make('span');
      setText(genreSpan, movie.Genre);
      genreRow.append(dot, genreSpan);
    }

    // IMDb rating badge (only if present)
    let ratingEl = null;
    if (movie.imdbRating && movie.imdbRating !== 'N/A') {
      ratingEl = make('div', 'modal-rating');
      ratingEl.textContent = `★  ${movie.imdbRating} / 10`;
    }

    // Metadata rows
    const meta = make('div', 'modal-meta');
    const metaFields = [
      ['Director', movie.Director],
      ['Cast',     movie.Actors],
      ['Runtime',  movie.Runtime],
      ['Rated',    movie.Rated],
      ['Language', movie.Language],
    ];

    metaFields.forEach(([label, value]) => {
      if (!value || value === 'N/A') return;
      const row    = make('p', 'modal-meta-row');
      const strong = make('strong');
      strong.textContent = label + ':';
      row.appendChild(strong);
      row.appendChild(document.createTextNode(' ' + value));
      meta.appendChild(row);
    });

    // Plot
    const plotEl = make('p', 'modal-plot');
    setText(plotEl, movie.Plot && movie.Plot !== 'N/A' ? movie.Plot : 'No plot summary available.');

    // Assemble
    if (ratingEl) info.append(titleEl, genreRow, ratingEl, meta, plotEl);
    else          info.append(titleEl, genreRow, meta, plotEl);

    detail.append(posterWrap, info);

    modalBody.innerHTML = '';
    modalBody.appendChild(detail);

  } catch (err) {
    modalBody.innerHTML = '';
    const errWrap = make('div', 'modal-loading');
    errWrap.textContent = 'Could not load details. Try again.';
    modalBody.appendChild(errWrap);
    showToast('Failed to load movie details.', 'error');
    console.error('[Modal]', err);
  }
}

function closeModal() {
  movieModal.classList.remove('open');
  document.body.style.overflow = '';
  // Clear content after transition so it doesn't flash on re-open
  setTimeout(() => { modalBody.innerHTML = ''; }, 320);
}

// ============================================================
//  Event Delegation — Search Results Grid
// ============================================================
moviesDiv.addEventListener('click', e => {
  const saveBtn = e.target.closest('.fav-btn');
  const card    = e.target.closest('.movie-card');

  if (saveBtn && card) {
    e.stopPropagation();
    addFavorite(card.dataset.imdbid, saveBtn);
    return;
  }

  if (card) openModal(card.dataset.imdbid);
});

// ============================================================
//  Event Delegation — Favourites Strip
// ============================================================
favoritesDiv.addEventListener('click', e => {
  const removeBtn = e.target.closest('.remove-btn');
  const card      = e.target.closest('.fav-card');

  if (removeBtn && card) {
    e.stopPropagation();
    removeFavorite(card.dataset.favid, card);
    return;
  }

  if (card) openModal(card.dataset.imdbid);
});

// ============================================================
//  Search Events
// ============================================================
searchBtn.addEventListener('click', searchMovies);

searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') searchMovies();
});

// ============================================================
//  Modal Events
// ============================================================
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalBackdrop').addEventListener('click', closeModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ============================================================
//  Init
// ============================================================
loadFavorites();
