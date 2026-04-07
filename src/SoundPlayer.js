import React, { useEffect, useRef } from "react";
import { getRandomArrayEntry } from "./CoordinateUtils";

const SoundPlayer = ({
  soundFiles,
  oneshot,
  volume,
  onShotFinish = null,
  persistKey = null,
}) => {
  const audioRef = useRef(null);
  const soundTracksRef = useRef([]);
  const isPlayingRef = useRef(false);

  // Create audio element once
  if (!audioRef.current) {
    audioRef.current = new Audio();
    try {
      audioRef.current.preload = "auto";
    } catch (e) {}
  }

  useEffect(() => {
    if (Array.isArray(soundFiles)) {
      soundTracksRef.current = soundFiles;
    } else {
      soundTracksRef.current = [soundFiles];
    }

    const audio = audioRef.current;

    const playNextTrack = async () => {
      if (!audio || isPlayingRef.current) {
        return;
      }

      const tracks = soundTracksRef.current;
      if (!tracks || tracks.length === 0) {
        return;
      }

      const next = getRandomArrayEntry(tracks);
      audio.src = next;

      try {
        const playResult = audio.play();
        if (playResult && typeof playResult.then === "function") {
          await playResult;
        }
        isPlayingRef.current = true;
      } catch (error) {
        console.log("Audio playback error:", error);
        isPlayingRef.current = false;
      }
    };

    // Handle when a track ends
    const handleTrackEnd = () => {
      isPlayingRef.current = false;
      if (oneshot) {
        onShotFinish?.();
      } else {
        playNextTrack();
      }
    };

    audio.addEventListener("ended", handleTrackEnd);

    // Attempt to restore persisted playback state (if requested and not oneshot)
    let persisted = null;
    let handleLoadedMetadata = null;
    if (persistKey && !oneshot && typeof sessionStorage !== "undefined") {
      try {
        const raw = sessionStorage.getItem(`soundplayer:${persistKey}`);
        if (raw) {
          persisted = JSON.parse(raw);
        }
      } catch (e) {
        persisted = null;
      }
    }

    if (
      persisted &&
      persisted.src &&
      persisted.soundFiles === JSON.stringify(soundTracksRef.current)
    ) {
      try {
        audio.src = persisted.src;
        handleLoadedMetadata = () => {
          if (typeof persisted.currentTime === "number") {
            try {
              audio.currentTime = persisted.currentTime;
            } catch (e) {}
          }
        };
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      } catch (e) {
        // ignore restore errors
      }
    }

    // If there's already a source and we have a position, try to resume
    const tryResume = async () => {
      try {
        if (
          audio.src &&
          audio.currentTime > 0 &&
          audio.currentTime < audio.duration
        ) {
          const playResult = audio.play();
          if (playResult && typeof playResult.then === "function") {
            await playResult;
          }
          isPlayingRef.current = true;
          return;
        }
      } catch (err) {
        console.log("Audio resume error:", err);
        isPlayingRef.current = false;
      }

      // Otherwise start a fresh track
      if (!isPlayingRef.current) {
        playNextTrack();
      }
    };

    tryResume();

    // Setup persistence saving interval if requested
    if (persistKey && !oneshot && typeof sessionStorage !== "undefined") {
      try {
        const toSave = {
          src: audio.src || null,
          currentTime: audio.currentTime || 0,
          soundFiles: JSON.stringify(soundTracksRef.current),
        };
        sessionStorage.setItem(
          `soundplayer:${persistKey}`,
          JSON.stringify(toSave),
        );
      } catch (e) {}
    }

    // Cleanup
    return () => {
      audio.removeEventListener("ended", handleTrackEnd);
      if (handleLoadedMetadata) {
        try {
          audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        } catch (e) {}
      }

      try {
        audio.pause();
      } catch (e) {}
      isPlayingRef.current = false;
    };
    // Re-run when soundFiles/oneshot change (not volume)
  }, [soundFiles, oneshot, onShotFinish]);

  // Update volume without restarting playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = typeof volume === "number" ? volume : audio.volume;
  }, [volume]);

  // Component doesn't render anything visible
  return null;
};

export default React.memo(SoundPlayer);
