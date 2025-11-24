const STORAGE_KEY = 'movie-app-favorites'

export function loadFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch (error) {
    console.error('Error leyendo favoritos de localStorage', error)
    return []
  }
}

export function saveFavorites(favorites) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  } catch (error) {
    console.error('Error guardando favoritos en localStorage', error)
  }
}
