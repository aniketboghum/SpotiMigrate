"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/header";
import { Progress } from "@/components/ui/progress";
import * as React from "react";

const genres = ["Pop", "Rock", "Hip-Hop", "Jazz", "Classical", "Electronic", "Country", "R&B", "Metal", "Indie"];
const moods = ["Happy", "Sad", "Energetic", "Calm", "Romantic", "Motivational", "Nostalgic", "Chill", "Party", "Focus"];

interface Track {
  name: string;
  artists: string[];
  album: string;
}

interface PlaylistResponse {
  tracks: Track[];
}

export default function AIPage() {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [playlist, setPlaylist] = useState<PlaylistResponse | null>(null);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  
  // Progress tracking state
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [migrationStatus, setMigrationStatus] = useState("");
  const [currentTrack, setCurrentTrack] = useState("");
  const [totalTracks, setTotalTracks] = useState(0);
  const [processedTracks, setProcessedTracks] = useState(0);
  const [tracksAdded, setTracksAdded] = useState(0);

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre);
    // Clear playlist if selection changes
    if (playlist) {
      setPlaylist(null);
    }
  };

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    // Clear playlist if selection changes
    if (playlist) {
      setPlaylist(null);
    }
  };

  const handleGenerate = async () => {
    if (!selectedGenre || !selectedMood) return;

    setIsGenerating(true);
    setPlaylist(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ai/generate_playlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mood: selectedMood,
          genre: selectedGenre,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Handle both possible response structures
      const playlistData = data.tracks ? data : (data.playlist || data);
      setPlaylist(playlistData);
      setPlaylistName(`${selectedMood} ${selectedGenre} Playlist`);
    } catch (error) {
      console.error('Error generating playlist:', error);
      alert('Failed to generate playlist. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateYouTubePlaylist = async () => {
    if (!playlist) return;

    setIsCreatingPlaylist(true);
    setMigrationProgress(0);
    setMigrationStatus("Starting migration...");
    setCurrentTrack("");
    setTotalTracks(playlist.tracks.length);
    setProcessedTracks(0);
    setTracksAdded(0);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/youtube/playlists/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sp_playlistId: "", // Not needed for AI playlists
          yt_playlist_name: playlistName,
          is_ai_playlist: true,
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
                setIsCreatingPlaylist(false);
                if (data.error) {
                  alert(`Playlist creation failed: ${data.error}`);
                } else {
                  alert(`Playlist created successfully! Added ${data.tracks_added} tracks to YouTube.`);
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
      console.error('Playlist creation error:', error);
      setIsCreatingPlaylist(false);
      alert('Failed to create playlist. Please try again.');
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
              AI Playlist Generator
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground">
              Create personalized playlists based on your mood and favorite genre using AI.
            </p>
          </div>
        </section>

        {/* Visual divider */}
        <Separator className="my-12" />

        {/* Genre Selection */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Select Genre</h2>
          <div className="flex flex-wrap gap-3">
            {genres.map((genre) => (
              <Button
                key={genre}
                variant={selectedGenre === genre ? "default" : "outline"}
                onClick={() => handleGenreSelect(genre)}
                className={`transition-all ${
                  selectedGenre === genre
                    ? "border-2 border-primary shadow-md"
                    : "border"
                }`}
              >
                {genre}
              </Button>
            ))}
          </div>
        </section>

        {/* Mood Selection */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Select Mood</h2>
          <div className="flex flex-wrap gap-3">
            {moods.map((mood) => (
              <Button
                key={mood}
                variant={selectedMood === mood ? "default" : "outline"}
                onClick={() => handleMoodSelect(mood)}
                className={`transition-all ${
                  selectedMood === mood
                    ? "border-2 border-primary shadow-md"
                    : "border"
                }`}
              >
                {mood}
              </Button>
            ))}
          </div>
        </section>

        {/* Generate Button */}
        <div className="text-center mb-8">
          <Button
            size="lg"
            className="px-8"
            onClick={handleGenerate}
            disabled={!selectedGenre || !selectedMood || isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate Playlist"}
          </Button>
        </div>

        {/* Playlist Preview */}
        {playlist && (
          <section className="mt-12">
            <div className="rounded-xl border bg-card text-card-foreground p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold">{playlistName}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {playlist.tracks.length} tracks
                  </p>
                </div>
                <input
                  type="text"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background text-foreground"
                  placeholder="Playlist name"
                />
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {playlist.tracks.map((track, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{track.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {track.artists.join(", ")} • {track.album}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground ml-4">
                      #{index + 1}
                    </span>
                  </div>
                ))}
              </div>

              {/* Progress Section */}
              {isCreatingPlaylist && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">Creating Playlist</h3>
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

              {/* Create YouTube Playlist Button */}
              <div className="mt-6 text-center">
                <Button
                  size="lg"
                  className="px-8"
                  onClick={handleCreateYouTubePlaylist}
                  disabled={isCreatingPlaylist || !playlistName.trim()}
                >
                  {isCreatingPlaylist ? "Creating..." : "Create Playlist on YouTube"}
                </Button>
              </div>
            </div>
          </section>
        )}
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

