# Pokémon Explorer

A futuristic Pokédex built with React and Vite. Browse, search, and explore Pokémon from the complete PokéAPI database.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)

## Features

- **Global search** — search by name or Pokédex ID across all 1,300+ Pokémon, not just the current page
- **Type filtering** — filter by any type, powered by the PokéAPI type endpoint
- **Pokémon Modal** — detailed view with stats, abilities, height/weight, and Pokédex description
- **Evolution Line** — dynamic evolution tree supporting linear, branching, and complex families (Eevee, Ralts, Wurmple)
- **Mega Evolutions** — displayed separately in the evolution view
- **Flip animation** — 3D card flip between details and evolution views
- **Favorites** — save Pokémon locally with persistent storage
- **Custom Pokéball** — branded SVG icon used in the header, favicon, and all loading states
- **Responsive** — works across desktop, tablet, and mobile

## Tech Stack

- React 18, Vite 5
- Tailwind CSS 3
- Lucide React (icons)
- PokéAPI (https://pokeapi.co)

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
