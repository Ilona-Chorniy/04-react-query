import axios from 'axios';
import { type Movie } from '../types/movie';

const API_KEY = import.meta.env.VITE_TMDB_TOKEN;
const BASE_URL = 'https://api.themoviedb.org/3/search/movie';

interface FetchMoviesResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export async function fetchMovies(query: string): Promise<Movie[]> {
  const response = await axios.get<FetchMoviesResponse>(BASE_URL, {
    params: { query },
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  });
  
  return response.data.results;
}