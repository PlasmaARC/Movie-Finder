import hero from "./assets/hero.png";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import "./App.css";
import { useState, useEffect } from "react";
import { useDebounce } from "react-use";
import { updateSearchTerm,getTrendingMovies } from "./appwrite";


const API_URL = "https://api.themoviedb.org/3";

const API_KEY = import.meta.env.VITE_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [moviesList, setMoviesList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [trendingMovies, setTrendingMovies] = useState([])

  useDebounce(()=>
    setDebouncedSearchTerm(searchTerm),500, [searchTerm]
  )

  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const endpoint = query
        ? `${API_URL}/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1`
        : `${API_URL}/discover/movie?language=en-US&page=1&sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error("Failed to catch Movies");
      }
      const data = await response.json();
      console.log(data);

      if (data.Response === "False") {
        setErrorMessage(data.Error || "Failed to catch Movies");
        setMoviesList([]);
        return;
      }

      setMoviesList(data.results || []);

      if(query && data.results.length > 0){
        await updateSearchTerm(query,data.results[0])
      }
    } catch (error) {
      console.log(`Error fetching movies: ${error}`);
      setErrorMessage("Error while catching Movies. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () =>{
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.log(`Error fetching trending movies: ${error}`)
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies()
  },[])

  return (
    <main>
      <div className="pattern">
        <div className="wrapper">
          <header>
            <img src={hero} alt="Hero Image Background" />
            <h1>
              Find <span className="text-gradient">Movies</span> You ll Enjoy
              Without the Hassle
            </h1>
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </header>
          {trendingMovies.length > 0 && (
            <section className="trending">
              <h2>Trending Movies</h2>

              <ul>
                {trendingMovies.map((movie,index) => (
                  <li key={movie.$id}>
                    <p>{index + 1 }</p>
                    <img src={movie.poster_url} alt={movie.title} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className="all-movies">
            <h2 className="mt-[40px] text-3xl">All Movies</h2>
            {isLoading ? (
              <Spinner />
            ) : errorMessage ? (
              <p className="text-red-500">{errorMessage}</p>
            ) : (
              <ul>
                {moviesList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
