import SearchBar from '../SearchBar/SearchBar';
import { useEffect, useState } from 'react';
import { type Movie } from '../../types/movie';
import toast, { Toaster } from 'react-hot-toast';
import MovieGrid from '../MovieGrid/MovieGrid';
import MovieModal from '../MovieModal/MovieModal';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import { fetchMovies } from '../../services/movieService';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import ReactPaginate from 'react-paginate';
import css from './App.module.css';

export default function App() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [query, setQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['movies', query, page],
    queryFn: () => fetchMovies(query, page),
    enabled: !!query,
    placeholderData: keepPreviousData,
  });

  const movies = data?.results || [];
  const totalPages = data?.total_pages || 0;
  const hasResults = movies.length > 0;

  useEffect(() => {
    if (query && !isLoading && !isError && !hasResults) {
      toast.error('No movies found for your request.');
    }
  }, [query, isLoading, isError, hasResults]);

  useEffect(() => {
    if (isError) {
      toast.error('Something went wrong. Please try again later.');
    }
  }, [isError]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedMovie) {
        setSelectedMovie(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedMovie]);

  function handleSearch(searchQuery: string) {
    setQuery(searchQuery);
    setPage(1);
  }

  function handlePageChange({ selected }: { selected: number }) {
    setPage(selected + 1);
  }

  function handleSelect(movie: Movie) {
    setSelectedMovie(movie);
  }

  function closeModal() {
    setSelectedMovie(null);
  }

  return (
    <div className={css.app}>
      <SearchBar onSubmit={handleSearch} />
      <Toaster />
      {isLoading ? (
        <Loader />
      ) : isError ? (
        <ErrorMessage />
      ) : (
        <MovieGrid movies={movies} onSelect={handleSelect} />
      )}
      {totalPages > 1 && (
        <ReactPaginate
          pageCount={totalPages}
          pageRangeDisplayed={5}
          marginPagesDisplayed={1}
          onPageChange={handlePageChange}
          forcePage={page - 1}
          containerClassName={css.pagination}
          activeClassName={css.active}
          nextLabel="→"
          previousLabel="←"
        />
      )}
      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={closeModal} />
      )}
    </div>
  );
}