import { useCallback, useEffect, useState } from "react";
import type { Song } from "../types/Song";

// Songs are keyed by bilibiliUrl: song.id is only unique within a year and
// shifts when a year's list is re-sorted, while the URL is unique and stable.
const STORAGE_KEY = "jd:songStats:v1";

export interface ClickStat {
  count: number;
  lastClickedAt: number;
}

export interface SongStats {
  likes: Record<string, number>;
  clicks: Record<string, ClickStat>;
}

const emptyStats = (): SongStats => ({ likes: {}, clicks: {} });

const loadStats = (): SongStats => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStats();
    const parsed = JSON.parse(raw) as Partial<SongStats>;
    return { likes: parsed.likes ?? {}, clicks: parsed.clicks ?? {} };
  } catch {
    return emptyStats();
  }
};

const saveStats = (stats: SongStats) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Storage unavailable (private mode, quota, blocked): keep in-memory only.
  }
};

export const songKey = (song: Song) => song.bilibiliUrl;

export const useSongStats = () => {
  const [stats, setStats] = useState<SongStats>(loadStats);

  // Keep other open tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setStats(loadStats());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = useCallback((fn: (prev: SongStats) => SongStats) => {
    setStats((prev) => {
      const next = fn(prev);
      saveStats(next);
      return next;
    });
  }, []);

  const toggleLike = useCallback(
    (song: Song) =>
      update((prev) => {
        const likes = { ...prev.likes };
        const key = songKey(song);
        if (key in likes) delete likes[key];
        else likes[key] = Date.now();
        return { ...prev, likes };
      }),
    [update],
  );

  const recordClick = useCallback(
    (song: Song) =>
      update((prev) => {
        const key = songKey(song);
        const count = (prev.clicks[key]?.count ?? 0) + 1;
        return {
          ...prev,
          clicks: { ...prev.clicks, [key]: { count, lastClickedAt: Date.now() } },
        };
      }),
    [update],
  );

  const resetClicks = useCallback(
    () => update((prev) => ({ ...prev, clicks: {} })),
    [update],
  );

  return { stats, toggleLike, recordClick, resetClicks };
};
