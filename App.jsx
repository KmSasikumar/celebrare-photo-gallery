import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useFetchPhotos } from "./useFetchPhotos.js";

/* ------------------------------------------------------------------ */
/* Favourites state lives in a useReducer (per the brief — not useState) */
/* ------------------------------------------------------------------ */
const FAV_KEY = "photo-gallery:favourites";

function favouritesReducer(state, action) {
  switch (action.type) {
    case "TOGGLE": {
      const id = action.id;
      // state is an array of favourited photo ids
      return state.includes(id)
        ? state.filter((favId) => favId !== id)
        : [...state, id];
    }
    case "HYDRATE":
      return Array.isArray(action.ids) ? action.ids : [];
    default:
      return state;
  }
}

function loadFavourites() {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* Heart icon (inline SVG, no icon library — brief says no UI libraries) */
/* ------------------------------------------------------------------ */
function HeartIcon({ filled }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Photo card                                                        */
/* ------------------------------------------------------------------ */
function PhotoCard({ photo, isFavourite, onToggleFavourite }) {
  // picsum serves sized images via /id/{id}/{w}/{h}
  const src = `https://picsum.photos/id/${photo.id}/600/400`;

  return (
    <article className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:shadow-md">
      <img
        src={src}
        alt={`Photo by ${photo.author}`}
        loading="lazy"
        className="aspect-[3/2] w-full object-cover"
      />
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <p className="truncate text-sm font-medium text-slate-800">
          {photo.author}
        </p>
        <button
          type="button"
          onClick={() => onToggleFavourite(photo.id)}
          aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
          aria-pressed={isFavourite}
          className={`rounded-full p-1.5 transition ${
            isFavourite
              ? "text-rose-600 hover:text-rose-700"
              : "text-slate-400 hover:text-rose-500"
          }`}
        >
          <HeartIcon filled={isFavourite} />
        </button>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                               */
/* ------------------------------------------------------------------ */
export default function App() {
  const { photos, loading, error } = useFetchPhotos();
  const [favourites, dispatch] = useReducer(favouritesReducer, undefined, loadFavourites);
  const [query, setQuery] = useState("");

  // Persist favourites to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(favourites));
    } catch {
      /* storage unavailable — favourites just won't persist */
    }
  }, [favourites]);

  // useCallback on the search handler (per the brief)
  const handleSearch = useCallback((e) => {
    setQuery(e.target.value);
  }, []);

  const toggleFavourite = useCallback((id) => {
    dispatch({ type: "TOGGLE", id });
  }, []);

  // useMemo for the filtered list — no API call on search (per the brief)
  const filteredPhotos = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return photos;
    return photos.filter((p) => p.author.toLowerCase().includes(q));
  }, [photos, query]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="mx-auto max-w-6xl px-4 pt-10 pb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Photo Gallery
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          30 photos from picsum.photos — search by author, tap the heart to
          save favourites.
        </p>
        <input
          type="search"
          value={query}
          onChange={handleSearch}
          placeholder="Search by author name…"
          aria-label="Search photos by author name"
          className="mt-5 w-full max-w-md rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16">
        {loading && (
          <div className="flex flex-col items-center gap-3 py-24" role="status">
            <div className="loader h-10 w-10 rounded-full border-4 border-slate-300 border-t-indigo-600" />
            <p className="text-sm text-slate-500">Loading photos…</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-8 text-center" role="alert">
            <p className="font-medium text-red-700">Couldn’t load photos.</p>
            <p className="mt-1 text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filteredPhotos.length === 0 && (
          <p className="py-24 text-center text-sm text-slate-500">
            No photos match “{query}”.
          </p>
        )}

        {!loading && !error && filteredPhotos.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredPhotos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                isFavourite={favourites.includes(photo.id)}
                onToggleFavourite={toggleFavourite}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-slate-400">
        {favourites.length > 0 &&
          `${favourites.length} favourite${favourites.length === 1 ? "" : "s"} saved locally.`}
      </footer>
    </div>
  );
}
