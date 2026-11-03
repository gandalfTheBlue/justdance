import type { MouseEvent } from "react";
import type { Song } from "../types/Song";
import "./SongCard.css";

interface SongCardProps {
  song: Song;
  liked: boolean;
  clicks: number;
  onToggleLike: (song: Song) => void;
  onPlay: (song: Song) => void;
  rank?: number;
  showYear?: boolean;
}

export const SongCard = ({
  song,
  liked,
  clicks,
  onToggleLike,
  onPlay,
  rank,
  showYear,
}: SongCardProps) => {
  const handleCardClick = () => {
    onPlay(song);
    window.open(song.bilibiliUrl, "_blank");
  };

  const handleLikeClick = (e: MouseEvent) => {
    // Liking shouldn't open the video or count as a play.
    e.stopPropagation();
    onToggleLike(song);
  };

  return (
    <div className="song-card" onClick={handleCardClick}>
      <div className="song-card-image">
        <img src={song.coverImage} alt={`${song.title} cover`} referrerPolicy="no-referrer" />
        <div className="song-card-overlay">
          <div className="play-button">▶</div>
        </div>
        {rank !== undefined && <span className="song-rank">#{rank}</span>}
        <button
          type="button"
          className={`like-button ${liked ? "like-button-active" : ""}`}
          aria-pressed={liked}
          aria-label={liked ? `Unlike ${song.title}` : `Like ${song.title}`}
          onClick={handleLikeClick}
        >
          {liked ? "❤️" : "♡"}
        </button>
      </div>
      <div className="song-card-content">
        <div className="song-header">
          <h3 className="song-title">{song.title}</h3>
          {clicks > 0 && (
            <span className="song-clicks" title={`Played ${clicks} times`}>
              ▶ {clicks}
            </span>
          )}
          <span className="song-duration">{song.duration}</span>
        </div>
        {showYear && song.year && <span className="song-year">JD{song.year}</span>}
      </div>
    </div>
  );
};
