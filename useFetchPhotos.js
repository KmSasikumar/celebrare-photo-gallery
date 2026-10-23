import { useEffect, useState } from "react";

const PHOTOS_URL = "https://picsum.photos/v2/list?limit=30";

/**
 * useFetchPhotos — custom hook that owns all fetch logic.
 * Returns { photos, loading, error } so the UI component stays clean.
 */
export function useFetchPhotos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(PHOTOS_URL);
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        const data = await res.json();
        if (!cancelled) {
          setPhotos(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Something went wrong while loading photos.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    // Avoid setting state on an unmounted component
    return () => {
      cancelled = true;
    };
  }, []);

  return { photos, loading, error };
}
