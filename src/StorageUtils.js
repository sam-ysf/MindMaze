// ============================================================================
// PLAYER-SCOPED STORAGE
// ============================================================================

export const loadPlayers = () => {
  const storedValue = localStorage.getItem("players");
  if (storedValue) {
    return JSON.parse(storedValue);
  }
  return [];
};

export const savePlayers = (players) => {
  localStorage.setItem("players", JSON.stringify(players));
};

export const loadPlayerKey = (playerId, key) => {
  const storedValue = localStorage.getItem(`player_${playerId}_${key}`);
  if (storedValue) {
    return JSON.parse(storedValue);
  }
  return null;
};

export const savePlayerKey = (playerId, key, data) => {
  localStorage.setItem(`player_${playerId}_${key}`, JSON.stringify(data));
};

export const clearPlayerData = (playerId) => {
  const prefix = `player_${playerId}_`;
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefix)) {
      keysToRemove.push(k);
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
};

// ============================================================================
// PLAYER-SCOPED CONVENIENCE FUNCTIONS (mirrors global functions)
// ============================================================================

export const savePlayerMazeData = (playerId, data) => {
  savePlayerKey(playerId, "mazeData", data);
};

export const loadPlayerMazeData = (playerId) => {
  return loadPlayerKey(playerId, "mazeData");
};

export const savePlayerPoints = (playerId, data) => {
  savePlayerKey(playerId, "points", data);
};

export const loadPlayerPoints = (playerId) => {
  return loadPlayerKey(playerId, "points");
};

export const savePlayerTorches = (playerId, data) => {
  savePlayerKey(playerId, "torches", data);
};

export const loadPlayerTorches = (playerId) => {
  return loadPlayerKey(playerId, "torches");
};

export const savePlayerTrophy = (playerId, data) => {
  savePlayerKey(playerId, "trophy", data);
};

export const loadPlayerTrophy = (playerId) => {
  return loadPlayerKey(playerId, "trophy");
};

export const savePlayerCurrentRoom = (playerId, y, x) => {
  savePlayerKey(playerId, "currentRoom", { y, x });
};

export const loadPlayerCurrentRoom = (playerId) => {
  return loadPlayerKey(playerId, "currentRoom");
};

export const savePlayerVisitedRoom = (playerId, y, x) => {
  // Persist each visited room as its own key to avoid read-modify-write races.
  const key = `player_${playerId}_visited_${y}_${x}`;
  try {
    localStorage.setItem(key, JSON.stringify({ y, x }));
  } catch (e) {
    // Fail silently on storage errors
  }
};

export const loadPlayerVisitedRooms = (playerId) => {
  const prefix = `player_${playerId}_visited_`;
  const results = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefix)) {
      try {
        const raw = localStorage.getItem(k);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed.y === "number" && typeof parsed.x === "number") {
            results.push(parsed);
          }
        }
      } catch (e) {
        // Fail silently on malformed entries
      }
    }
  }
  return results.length > 0 ? results : null;
};
