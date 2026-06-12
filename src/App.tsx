import { useState } from "react";
import { SongCard } from "./components/SongCard";
import { songs } from "./data/songs";
import { jd2020Songs } from "./data/songs-jd2020";
import type { Song } from "./types/Song";
import "./App.css";

type Tab = "2020" | "other";

interface TabConfig {
  key: Tab;
  label: string;
  count: number;
}

const tabConfig: TabConfig[] = [
  { key: "2020", label: "Just Dance 2020", count: jd2020Songs.length },
  { key: "other", label: "Other", count: songs.length },
];

const songMap: Record<Tab, Song[]> = {
  "2020": jd2020Songs,
  other: songs,
};

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("2020");
  const filteredSongs = songMap[activeTab];

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎵 Just Dance - Bilibili Music Collection</h1>
        <p>Discover amazing songs from Bilibili</p>
      </header>

      <main className="app-main">
        <div className="tabs">
          {tabConfig.map((tab) => (
            <button
              key={tab.key}
              className={`tab ${activeTab === tab.key ? "tab-active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              <span className="tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="songs-grid">
          {filteredSongs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
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
