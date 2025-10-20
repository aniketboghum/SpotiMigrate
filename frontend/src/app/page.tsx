"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/header";
import { Combobox } from "@/components/ui/combobox";
import { Progress } from "@/components/ui/progress";
import * as React from "react";

export default function Home() {
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [isYouTubeConnected, setIsYouTubeConnected] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = React.useState("")
  const [selectedPlaylistName, setSelectedPlaylistName] = React.useState("")  

  const [playlists, setPlaylists] = useState([]);
  
  // Progress tracking state
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [migrationStatus, setMigrationStatus] = useState("");
  const [currentTrack, setCurrentTrack] = useState("");
  const [totalTracks, setTotalTracks] = useState(0);
  const [processedTracks, setProcessedTracks] = useState(0);
  const [tracksAdded, setTracksAdded] = useState(0);

  // Check for existing token on component mount
  useEffect(() => {

  }, []);

  // Disconnect functions
  const handleSpotifyDisconnect = () => {
    setIsSpotifyConnected(false);
    setPlaylists([]);
  };

  const handleYouTubeDisconnect = () => {
    setIsYouTubeConnected(false);
  };

  // OAuth popup handler function
  const handleSpotifyLogin = () => {
    const popup = window.open(
      'http://127.0.0.1:8000/spotify/login', // Your custom API endpoint
      'spotify-oauth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    // Listen for messages from the popup
    const messageListener = async (event: MessageEvent) => {
      console.log('Received message from popup:', event.origin, event.data);
      
      // Make sure the message is from your backend domain for security
      if (event.origin !== 'http://127.0.0.1:8000' && event.origin !== 'http://localhost:8000') {
        console.log('Message rejected due to origin mismatch. Expected: http://127.0.0.1:8000 or http://localhost:8000, Got:', event.origin);
        return;
      }

      if (event.data.type === 'SPOTIFY_AUTH_SUCCESS') {
        // Handle successful authentication
        console.log('Spotify authentication successful:', event.data);
        setIsSpotifyConnected(true);
        const playlists = await fetch('http://127.0.0.1:8000/spotify/playlists');
        const playlistsData = await playlists.json();
        setPlaylists(playlistsData.playlists);

        popup?.close();
        window.removeEventListener('message', messageListener);
        
        console.log('✅ Successfully connected to Spotify!');
      } else if (event.data.type === 'SPOTIFY_AUTH_ERROR') {
        // Handle authentication error
        console.error('Spotify authentication failed:', event.data.error);
        alert('Spotify authentication failed. Please try again.');
        popup?.close();
        window.removeEventListener('message', messageListener);
      }
    };

    // Add message listener
    window.addEventListener('message', messageListener);

    // Check if popup was closed manually
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageListener);
      }
    }, 1000);
  };

  // YouTube OAuth popup handler function
  const handleYouTubeLogin = () => {
    const popup = window.open(
      'http://127.0.0.1:8000/youtube/login',
      'youtube-oauth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    // Listen for messages from the popup
    const messageListener = async (event: MessageEvent) => {
      console.log('Received message from popup:', event.origin, event.data);
      
      // Make sure the message is from your backend domain for security
      if (event.origin !== 'http://127.0.0.1:8000' && event.origin !== 'http://localhost:8000') {
        console.log('Message rejected due to origin mismatch. Expected: http://127.0.0.1:8000 or http://localhost:8000, Got:', event.origin);
        return;
      }

      if (event.data.type === 'YOUTUBE_AUTH_SUCCESS') {
        // Handle successful authentication
        console.log('YouTube authentication successful:', event.data);
        setIsYouTubeConnected(true);

        popup?.close();
        window.removeEventListener('message', messageListener);
        
        console.log('✅ Successfully connected to YouTube!');
      } else if (event.data.type === 'YOUTUBE_AUTH_ERROR') {
        // Handle authentication error
        console.error('YouTube authentication failed:', event.data.error);
        alert('YouTube authentication failed. Please try again.');
        popup?.close();
        window.removeEventListener('message', messageListener);
      }
    };

    // Add message listener
    window.addEventListener('message', messageListener);

    // Check if popup was closed manually
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageListener);
      }
    }, 1000);
  };

  // Handle migration start
  const handleStartMigration = async () => {
    console.log("playlist id", selectedPlaylistId)
    console.log("playlist name", selectedPlaylistName)
    if (!selectedPlaylistId || !isSpotifyConnected || !isYouTubeConnected) {
      alert('Please connect to both Spotify and YouTube, and select a playlist to migrate.');
      return;
    }

    // Reset progress state
    setIsMigrating(true);
    setMigrationProgress(0);
    setMigrationStatus("Starting migration...");
    setCurrentTrack("");
    setTotalTracks(0);
    setProcessedTracks(0);
    setTracksAdded(0);

    try {
      const response = await fetch('http://127.0.0.1:8000/youtube/playlists/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sp_playlistId: selectedPlaylistId,
          yt_playlist_name: selectedPlaylistName
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body reader available');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              setMigrationProgress(data.progress || 0);
              setMigrationStatus(data.status || "");
              setCurrentTrack(data.current_track || "");
              setTotalTracks(data.total_tracks || 0);
              setProcessedTracks(data.processed || 0);
              setTracksAdded(data.tracks_added || 0);

              if (data.completed) {
                setIsMigrating(false);
                if (data.error) {
                  alert(`Migration failed: ${data.error}`);
                } else {
                  alert(`Migration successful! Created playlist with ${data.tracks_added} tracks.`);
                }
                break;
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Migration error:', error);
      setIsMigrating(false);
      alert('Migration failed. Please try again.');
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />
      {/* Main content */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 pt-28 pb-16">
        {/* Hero */}
        <section className="text-center">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-balance">
              Move playlists between platforms in minutes
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground">
              Seamlessly migrate your music between Spotify and YouTube Music with accurate matches and zero fuss.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              {!isSpotifyConnected ? (
                <Button 
                  className="w-full sm:w-auto" 
                  onClick={handleSpotifyLogin}
                >
                  <img src="/icons/spotify.png" alt="spotify" width={16} height={16} />
                  <span className="ml-2">Login with Spotify</span>
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button 
                    className="w-full sm:w-auto" 
                    variant="outline"
                    disabled
                  >
                    <img src="/icons/spotify.png" alt="spotify" width={16} height={16} />
                    <span className="ml-2">✓ Connected to Spotify</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleSpotifyDisconnect}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Disconnect
                  </Button>
                </div>
              )}
              {!isYouTubeConnected ? (
                <Button 
                  className="w-full sm:w-auto" 
                  variant="secondary"
                  onClick={handleYouTubeLogin}
                >
                  <img src="/icons/youtube_music.png" alt="youtube music" width={16} height={16} />
                  <span className="ml-2">Login with YouTube</span>
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button 
                    className="w-full sm:w-auto" 
                    variant="outline"
                    disabled
                  >
                    <img src="/icons/youtube_music.png" alt="youtube music" width={16} height={16} />
                    <span className="ml-2">✓ Connected to YouTube</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleYouTubeDisconnect}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Disconnect
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Visual divider */}
        <Separator className="my-12" />

        {/* Features */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="rounded-xl border bg-card text-card-foreground p-6">
            <h3 className="font-semibold text-lg">Step: 1</h3>
            <p className="mt-2 text-sm text-muted-foreground">Login to Spotify and Youtube Music by clicking the button above.</p>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground p-6">
            <h3 className="font-semibold text-lg">Step: 2</h3>
            <p className="mt-2 text-sm text-muted-foreground">Select the playlists you want to migrate from the Dropdown.</p>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground p-6">
            <h3 className="font-semibold text-lg">Step: 3</h3>
            <p className="mt-2 text-sm text-muted-foreground">Click Start Migrating to start the migration.</p>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-12 text-center flex flex-col items-center justify-center gap-4">
          <Combobox playlists={playlists} 
                    selectedPlaylistId={selectedPlaylistId} 
                    setSelectedPlaylistId={setSelectedPlaylistId}
                    selectedPlaylistName={selectedPlaylistName}
                    setSelectedPlaylistName={setSelectedPlaylistName}/>
          
          {/* Progress Section */}
          {isMigrating && (
            <div className="w-full max-w-2xl mt-6 p-6 bg-card rounded-lg border">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Migration Progress</h3>
                  <p className="text-sm text-muted-foreground">{migrationStatus}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{migrationProgress}% Complete</span>
                    <span>{processedTracks} / {totalTracks} tracks</span>
                  </div>
                  <Progress value={migrationProgress} className="w-full" />
                </div>
                
                {currentTrack && (
                  <div className="text-center">
                    <p className="text-sm font-medium">Currently processing:</p>
                    <p className="text-sm text-muted-foreground truncate">{currentTrack}</p>
                  </div>
                )}
                
                {tracksAdded > 0 && (
                  <div className="text-center">
                    <p className="text-sm text-green-600 font-medium">
                      ✓ {tracksAdded} tracks successfully added
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <Button 
            size="lg" 
            className="px-8"
            onClick={handleStartMigration}
            disabled={!selectedPlaylistId || !isSpotifyConnected || !isYouTubeConnected || isMigrating}
          >
            {isMigrating ? "Migrating..." : "Start Migrating"}
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} SpotiMigrate</span>
        </div>
      </footer>
    </div>
  );
}
