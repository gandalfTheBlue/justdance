import type { Song } from "../types/Song";
import "./SongCard.css";

interface SongCardProps {
  song: Song;
}

export const SongCard = ({ song }: SongCardProps) => {
  const handleCardClick = () => {
    window.open(song.bilibiliUrl, "_blank");
  };

  return (
    <div className="song-card" onClick={handleCardClick}>
      <div className="song-card-image">
        <img src={song.coverImage} alt={`${song.title} cover`} />
        <div className="song-card-overlay">
          <div className="play-button">▶</div>
        </div>
      </div>
      <div className="song-card-content">
        <div className="song-header">
          <h3 className="song-title">{song.title}</h3>
          <span className="song-duration">{song.duration}</span>
        </div>
      </div>
    </div>
  );
};
