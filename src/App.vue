<script setup>
import { ref, computed, onMounted } from 'vue'
import { getPopularMovies, searchMovies, getGenres } from './api/tmdb'
import { loadFavorites, saveFavorites } from './utils/favorites'

const movies = ref([])
const genres = ref([])
const searchQuery = ref('')
const selectedGenre = ref('all')
const selectedMovie = ref(null)
const favorites = ref([])

const isLoading = ref(false)
const errorMessage = ref('')

const filteredMovies = computed(() => {
  let list = movies.value

  if (selectedGenre.value !== 'all') {
    const genreId = Number(selectedGenre.value)
    list = list.filter((movie) =>
      movie.genre_ids && movie.genre_ids.includes(genreId)
    )
  }

  return list
})

function isFavorite(movie) {
  return favorites.value.some((fav) => fav.id === movie.id)
}

function toggleFavorite(movie) {
  if (isFavorite(movie)) {
    favorites.value = favorites.value.filter((fav) => fav.id !== movie.id)
  } else {
    favorites.value.push(movie)
  }
  saveFavorites(favorites.value)

  if (selectedMovie.value && selectedMovie.value.id === movie.id) {
    selectedMovie.value = { ...movie }
  }
}

function selectMovie(movie) {
  selectedMovie.value = movie
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function loadInitialData() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [popular, genreList] = await Promise.all([
      getPopularMovies(),
      getGenres(),
    ])
    movies.value = popular
    genres.value = genreList
  } catch (error) {
    console.error(error)
    errorMessage.value = 'Hubo un problema al cargar las películas.'
  } finally {
    isLoading.value = false
  }
}

async function handleSearch() {
  const term = searchQuery.value.trim()

  if (!term) {
    await loadInitialData()
    selectedMovie.value = null
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  try {
    const results = await searchMovies(term)
    movies.value = results
    selectedMovie.value = null
  } catch (error) {
    console.error(error)
    errorMessage.value = 'No se pudieron buscar las películas.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  favorites.value = loadFavorites()
  loadInitialData()
})
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1 class="app-title">Parcial 2 Peliculas Vue - Avila Pelagatti</h1>
      <p class="app-subtitle">
        Buscar, filtrar y guardar tus películas favoritas
      </p>
    </header>

    <main class="app-main">
      <section class="search-section">
        <form class="search-form" @submit.prevent="handleSearch">
          <input
            v-model="searchQuery"
            class="search-input"
            type="text"
            placeholder="Buscar por título..."
          />
          <button type="submit" class="search-button">Buscar</button>
        </form>

        <div class="filter-row">
          <label class="filter-label" for="genre-select">Filtrar por género:</label>
          <select
            id="genre-select"
            v-model="selectedGenre"
            class="filter-select"
          >
            <option value="all">Todos</option>
            <option
              v-for="genre in genres"
              :key="genre.id"
              :value="genre.id"
            >
              {{ genre.name }}
            </option>
          </select>
        </div>
      </section>

      <section class="status-section">
        <p v-if="isLoading" class="status status-loading">
          Cargando películas...
        </p>
        <p v-if="errorMessage" class="status status-error">
          {{ errorMessage }}
        </p>
        <p
          v-if="!isLoading && !errorMessage && !filteredMovies.length"
          class="status"
        >
          No se encontraron películas.
        </p>
      </section>

      <section class="content">
        <div class="movie-list">
          <article
            v-for="movie in filteredMovies"
            :key="movie.id"
            class="movie-card"
            @click="selectMovie(movie)"
          >
            <img
              v-if="movie.poster_path"
              class="movie-poster"
              :src="`https://image.tmdb.org/t/p/w342${movie.poster_path}`"
              :alt="movie.title"
              loading="lazy"
            />
            <div class="movie-info">
              <h2 class="movie-title">{{ movie.title }}</h2>
              <p class="movie-year">
                {{ movie.release_date ? movie.release_date.slice(0, 4) : '—' }}
              </p>
              <p class="movie-rating">
                ⭐ {{ movie.vote_average?.toFixed(1) ?? 'N/A' }}
              </p>
            </div>
            <button
              class="fav-button"
              @click.stop="toggleFavorite(movie)"
            >
              {{ isFavorite(movie) ? '★ Fav' : '☆ Fav' }}
            </button>
          </article>
        </div>

        <aside v-if="selectedMovie" class="movie-details">
          <h2 class="details-title">{{ selectedMovie.title }}</h2>
          <p class="details-year">
            Año: {{ selectedMovie.release_date ? selectedMovie.release_date.slice(0, 4) : '—' }}
          </p>
          <img
            v-if="selectedMovie.poster_path"
            class="details-poster"
            :src="`https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`"
            :alt="selectedMovie.title"
          />
          <p class="details-overview">
            {{ selectedMovie.overview || 'Sin descripción disponible.' }}
          </p>
          <p class="details-extra">
            Puntuación: ⭐ {{ selectedMovie.vote_average?.toFixed(1) ?? 'N/A' }}
          </p>
          <button
            class="fav-button fav-button-big"
            @click="toggleFavorite(selectedMovie)"
          >
            {{ isFavorite(selectedMovie) ? 'Quitar de favoritos' : 'Agregar a favoritos' }}
          </button>
        </aside>
      </section>
    </main>
  </div>
</template>

<style scoped>

.app {
  min-height: 100vh;
  background: #050816;
  color: #f5f5f5;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    sans-serif;
  padding: 1rem;
}

.app-header {
  text-align: center;
  margin-bottom: 1rem;
}

.app-title {
  font-size: 1.8rem;
  font-weight: 700;
}

.app-subtitle {
  font-size: 0.9rem;
  color: #c0c0c0;
}

.app-main {
  max-width: 1200px;
  margin: 0 auto;
}

.search-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.search-form {
  display: flex;
  gap: 0.5rem;
}

.search-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  border: 1px solid #333;
  background: #0b1020;
  color: #f5f5f5;
}

.search-button {
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: none;
  background: #6366f1;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.search-button:hover {
  background: #4f46e5;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.85rem;
}

.filter-select {
  flex: 1;
  padding: 0.4rem 0.5rem;
  border-radius: 999px;
  border: 1px solid #333;
  background: #0b1020;
  color: #f5f5f5;
}

.status-section {
  margin-bottom: 0.5rem;
}

.status {
  font-size: 0.9rem;
  color: #c0c0c0;
}

.status-loading {
  color: #38bdf8;
}

.status-error {
  color: #f97373;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.movie-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.75rem;
}

.movie-card {
  display: flex;
  flex-direction: column;
  background: #0b1020;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid #1e293b;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.movie-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
}

.movie-poster {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.movie-info {
  padding: 0.5rem 0.6rem;
}

.movie-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.15rem;
}

.movie-year {
  font-size: 0.8rem;
  color: #9ca3af;
}

.movie-rating {
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.fav-button {
  margin: 0.4rem 0.6rem 0.55rem;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  border: none;
  background: #111827;
  color: #fbbf24;
  font-size: 0.75rem;
  cursor: pointer;
}

.movie-details {
  background: #020617;
  border-radius: 1rem;
  padding: 1rem;
  border: 1px solid #1f2937;
}

.details-title {
  font-size: 1.2rem;
  margin-bottom: 0.2rem;
}

.details-year {
  font-size: 0.9rem;
  color: #9ca3af;
  margin-bottom: 0.5rem;
}

.details-poster {
  width: 100%;
  max-width: 300px;
  border-radius: 0.75rem;
  margin-bottom: 0.75rem;
}

.details-overview {
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.details-extra {
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.fav-button-big {
  width: 100%;
}

@media (min-width: 768px) {
  .content {
    flex-direction: row;
    align-items: flex-start;
  }

  .movie-list {
    flex: 2;
  }

  .movie-details {
    flex: 1;
    position: sticky;
    top: 1rem;
  }
}
</style>