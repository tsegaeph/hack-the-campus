# Hack the Campus (Vite + React + TS)

This is a starter for the "Hack the campus" CTF-like UI with a neon cyberpunk main menu and a Roadmap screen.

Quick start:
1. npm create vite@latest hack-the-campus -- --template react-ts
2. cd hack-the-campus
3. npm install
4. npm install react-router-dom
5. npm install -D @types/react-router-dom
6. Replace the `src` and `index.html` with the files provided in this repo
7. npm run dev

What's included:
- Neon main menu with START GAME / ABOUT / SETTINGS buttons
- Roadmap screen with level nodes and SVG connectors
- Basic styling and animations to match the screenshots' vibe

How to extend:
- Add more levels in src/pages/Roadmap.tsx (the nodes array)
- Connect nodes dynamically by adding connections in Roadmap
- Replace background/graphics with assets you prefer