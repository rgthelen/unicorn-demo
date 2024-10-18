// src/components/AudioPlayer.js
import React, { useEffect, useRef } from 'react';
import './AudioPlayer.css'; // Import a CSS file for styling

function AudioPlayer({ audioData }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioData && audioRef.current) {
      const audioBlob = new Blob([new Uint8Array(audioData)], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Pause the audio if it's currently playing
      if (!audioRef.current.paused) {
        audioRef.current.pause();
      }

      // Reset the audio element
      audioRef.current.src = audioUrl;
      audioRef.current.load(); // Load the new audio source

      // Play the audio after ensuring it's loaded
      audioRef.current.oncanplaythrough = () => {
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      };

      // Clean up the object URL to avoid memory leaks
      return () => {
        URL.revokeObjectURL(audioUrl);
      };
    }
  }, [audioData]);

  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.error('Error replaying audio:', error);
      });
    }
  };

  return (
    <div className="audio-player">
      <audio ref={audioRef}>
        Your browser does not support the audio element.
      </audio>
      <div className="audio-controls">
        <button onClick={handleReplay}>Replay</button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          onChange={(e) => {
            if (audioRef.current) {
              audioRef.current.volume = e.target.value;
            }
          }}
        />
      </div>
    </div>
  );
}

export default AudioPlayer;
