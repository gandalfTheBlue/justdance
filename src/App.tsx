import { SongCard } from "./components/SongCard";
import { songs } from "./data/songs";
import type { Song } from "./types/Song";
import "./App.css";

function groupByYear(songs: Song[]) {
  const groups: Record<string, Song[]> = {};

  for (const song of songs) {
    const key = song.year ?? "Other";
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(song);
  }

  return groups;
}

function App() {
  const grouped = groupByYear(songs);
  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    if (a === "Other") return 1;
    if (b === "Other") return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎵 Just Dance - Bilibili Music Collection</h1>
        <p>Discover amazing songs from Bilibili</p>
      </header>

      <main className="app-main">
        {sortedKeys.map((year) => (
          <section key={year} className="year-section">
            <h2 className="year-heading">
              {year === "Other"
                ? "🎶 Other"
                : `🎮 Just Dance ${year}`}
            </h2>

            {year === "Other" && (
              <p className="year-subtitle">
                Songs from various years - help us categorize them!
              </p>
            )}

            <div className="songs-grid">
              {grouped[year].map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="app-footer">
        <p>
          Click on any song card to watch on{" "}
          <a
            href="https://www.bilibili.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Bilibili
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
