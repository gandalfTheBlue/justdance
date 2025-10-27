import { SongCard } from './components/SongCard'
import { songs } from './data/songs'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>🎵 Just Dance - Bilibili Music Collection</h1>
        <p>Discover amazing songs from Bilibili</p>
      </header>
      
      <main className="app-main">
        <div className="songs-grid">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      </main>
      
      <footer className="app-footer">
        <p>Click on any song card to watch on <a href="https://www.bilibili.com/" target="_blank" rel="noopener noreferrer">Bilibili</a></p>
      </footer>
    </div>
  )
}

export default App
