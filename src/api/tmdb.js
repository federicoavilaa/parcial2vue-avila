import axios from 'axios'

const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzOWJmOTJlOTg4YWRlOTVlZTA3MmQwMjA2ZDUyNDJkZSIsIm5iZiI6MTc2MzUwNzI1Ny4yNCwic3ViIjoiNjkxY2ZjMzlkMTM1MjYxOThkNzVmZjE0Iiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.gfNkq3oCtcmwTq6AWUmoIW8omptbLr8Iv_2mS1Vhaq4'

const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  },
})

export async function getPopularMovies() {
  const res = await api.get('/movie/popular', {
    params: {
      language: 'es-ES',
      page: 1,
    },
  })
  return res.data.results
}

export async function searchMovies(query) {
  const res = await api.get('/search/movie', {
    params: {
      query,
      include_adult: false,
      language: 'es-ES',
      page: 1,
    },
  })
  return res.data.results
}

export async function getGenres() {
  const res = await api.get('/genre/movie/list', {
    params: {
      language: 'es-ES',
    },
  })
  return res.data.genres
}
