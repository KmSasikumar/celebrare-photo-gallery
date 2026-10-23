# Photo Gallery Web App

A responsive photo gallery built from scratch with **React + Vite + Tailwind CSS**
(no UI component libraries) — prescreening assignment for Celebrare.

## What it does

- Fetches 30 photos from `https://picsum.photos/v2/list?limit=30`
- Shows a loading spinner while fetching and an error state with retry on failure
- Responsive grid: 4 columns on desktop, 2 on tablet, 1 on mobile
- Each card shows the photo, the author name, and a heart icon
- Real-time search filters by author name (client-side, no extra API calls)
- Favourites are toggled with `useReducer` and persisted to `localStorage`

## React concepts used

| Concept | Where |
|---|---|
| Custom hook | `src/hooks/useFetchPhotos.js` — all fetch logic, returns `{ photos, loading, error }` |
| `useReducer` | favourites toggle (`TOGGLE` / `HYDRATE` actions) in `src/App.jsx` |
| `useCallback` | search input handler and favourite toggle handler |
| `useMemo` | filtered photo list (recomputed only when photos or query change) |
| `useEffect` | data fetch on mount + persisting favourites to `localStorage` |

## Run it

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
