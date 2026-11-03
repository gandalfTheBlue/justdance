import { useEffect, useMemo, useState } from "react";
import { SongCard } from "./components/SongCard";
import { jd2020Songs } from "./data/songs-jd2020";
import { jd2021Songs } from "./data/songs-jd2021";
import { jd2022Songs } from "./data/songs-jd2022";
import { jd2027Songs } from "./data/songs-jd2027";
import { jd2026Songs } from "./data/songs-jd2026";
import { jd2023Songs } from "./data/songs-jd2023";
import { jd2019Songs } from "./data/songs-jd2019";
import { jd2018Songs } from "./data/songs-jd2018";
import { jd2017Songs } from "./data/songs-jd2017";
import { songKey, useSongStats } from "./hooks/useSongStats";
import type { Song } from "./types/Song";
import "./App.css";

type YearTab =
  | "2027"
  | "2026"
  | "2023"
  | "2022"
  | "2021"
  | "2020"
  | "2019"
  | "2018"
  | "2017";

type Tab = YearTab | "liked" | "top";

interface TabConfig {
  key: YearTab;
  label: string;
  count: number;
}

const tabConfig: TabConfig[] = [
  { key: "2027", label: "Just Dance 2027", count: jd2027Songs.length },
  { key: "2026", label: "Just Dance 2026", count: jd2026Songs.length },
  { key: "2023", label: "Just Dance 2023", count: jd2023Songs.length },
  { key: "2022", label: "Just Dance 2022", count: jd2022Songs.length },
  { key: "2021", label: "Just Dance 2021", count: jd2021Songs.length },
  { key: "2020", label: "Just Dance 2020", count: jd2020Songs.length },
  { key: "2019", label: "Just Dance 2019", count: jd2019Songs.length },
  { key: "2018", label: "Just Dance 2018", count: jd2018Songs.length },
  { key: "2017", label: "Just Dance 2017", count: jd2017Songs.length },
];

const songMap: Record<YearTab, Song[]> = {
  "2027": jd2027Songs,
  "2026": jd2026Songs,
  "2023": jd2023Songs,
  "2022": jd2022Songs,
  "2021": jd2021Songs,
  "2020": jd2020Songs,
  "2019": jd2019Songs,
  "2018": jd2018Songs,
  "2017": jd2017Songs,
};

const allSongs = Object.values(songMap).flat();
const songsByKey = new Map(allSongs.map((song) => [songKey(song), song]));

const TOP_LIMIT = 20;
const DEFAULT_TAB: Tab = "2027";

const isTab = (value: string): value is Tab =>
  value === "liked" || value === "top" || value in songMap;

const tabFromHash = (): Tab => {
  const hash = window.location.hash.slice(1);
  return isTab(hash) ? hash : DEFAULT_TAB;
};

function App() {
  const [activeTab, setActiveTab] = useState<Tab>(tabFromHash);
  const [showAllTop, setShowAllTop] = useState(false);
  const { stats, toggleLike, recordClick, resetClicks } = useSongStats();

  useEffect(() => {
    const onHashChange = () => setActiveTab(tabFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const likedSongs = useMemo(
    () =>
      Object.entries(stats.likes)
        .sort(([, a], [, b]) => b - a)
        .map(([key]) => songsByKey.get(key))
        .filter((song): song is Song => song !== undefined),
    [stats.likes],
  );

  const topSongs = useMemo(
    () =>
      Object.entries(stats.clicks)
        .filter(([, c]) => c.count > 0)
        .sort(
          ([, a], [, b]) =>
            b.count - a.count || b.lastClickedAt - a.lastClickedAt,
        )
        .map(([key]) => songsByKey.get(key))
        .filter((song): song is Song => song !== undefined),
    [stats.clicks],
  );

  const handleResetClicks = () => {
    if (window.confirm("Reset all play counts?")) resetClicks();
  };

  const renderCard = (song: Song, extra?: { rank?: number; showYear?: boolean }) => (
    <SongCard
      key={songKey(song)}
      song={song}
      liked={songKey(song) in stats.likes}
      clicks={stats.clicks[songKey(song)]?.count ?? 0}
      onToggleLike={toggleLike}
      onPlay={recordClick}
      {...extra}
    />
  );

  const renderTab = (key: Tab, label: string, count: number) => (
    <a
      key={key}
      href={`#${key}`}
      role="tab"
      aria-selected={activeTab === key}
      className={`tab ${activeTab === key ? "tab-active" : ""}`}
    >
      {label}
      <span className="tab-count">{count}</span>
    </a>
  );

  const renderContent = () => {
    if (activeTab === "liked") {
      if (likedSongs.length === 0) {
        return <p className="empty-state">Tap ♡ on any song to save it here.</p>;
      }
      return (
        <div className="songs-grid">
          {likedSongs.map((song) => renderCard(song, { showYear: true }))}
        </div>
      );
    }

    if (activeTab === "top") {
      if (topSongs.length === 0) {
        return <p className="empty-state">Songs you play will be ranked here.</p>;
      }
      const visible = showAllTop ? topSongs : topSongs.slice(0, TOP_LIMIT);
      return (
        <>
          <div className="songs-grid">
            {visible.map((song, i) => renderCard(song, { rank: i + 1, showYear: true }))}
          </div>
          <div className="list-actions">
            {topSongs.length > TOP_LIMIT && (
              <button type="button" className="list-action" onClick={() => setShowAllTop((v) => !v)}>
                {showAllTop ? `Show top ${TOP_LIMIT}` : `Show all ${topSongs.length}`}
              </button>
            )}
            <button type="button" className="list-action list-action-muted" onClick={handleResetClicks}>
              Reset counts
            </button>
          </div>
        </>
      );
    }

    return <div className="songs-grid">{songMap[activeTab].map((song) => renderCard(song))}</div>;
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎵 Just Dance - Bilibili Music Collection</h1>
        <p>Discover amazing songs from Bilibili</p>
      </header>

      <main className="app-main">
        <div className="tabs" role="tablist" aria-label="Song lists">
          {renderTab("liked", "❤️ Liked", likedSongs.length)}
          {renderTab("top", "🔥 Most Clicked", topSongs.length)}
          <span className="tab-divider" aria-hidden="true" />
          {tabConfig.map((tab) => renderTab(tab.key, tab.label, tab.count))}
        </div>

        {renderContent()}
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
