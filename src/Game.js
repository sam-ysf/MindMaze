import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { AreaOfInterestSelector } from "./AreaOfInterestSelector.js";
import { controlPanelAssets, promptAssets, splashAssets } from "./AssetMaps.js";
import {
  CLOSE_BUTTON_STYLES,
  gameConfig,
  sceneStyles,
  uiConfig,
} from "./Constants.js";
import { getRandomArrayEntry } from "./CoordinateUtils.js";
import CountdownTimer from "./CountdownTimer.js";
import { LevelSelector } from "./LevelSelector.js";
import { generateMaze, generateSceneData } from "./MazeGeneration.js";
import jsonArtLanguageLiterature from "./questions/art-language-literature.json";
import jsonGeography from "./questions/geography.json";
import jsonHistory from "./questions/history.json";
import jsonLifeScience from "./questions/life-science.json";
import jsonPerformingArts from "./questions/performing-arts.json";
import jsonPhysicalScience from "./questions/physical-science.json";
import jsonReligionPhilosophy from "./questions/religion-philosophy.json";
import jsonSocialScience from "./questions/social-science.json";
import jsonSportsHobbiesPets from "./questions/sports-hobbies-pets.json";
import {
  drawEntireMinimap,
  drawMinimap,
  drawMazeCursor,
  drawMazeProgress,
  drawRoom,
  drawSplash,
  drawCastleEntry,
  drawEncarta1,
  drawEncarta2,
  drawStartCorridor,
  drawStartCorridorContinued,
  drawThroneRoomEntry,
  drawThroneRoom,
  drawThroneRoomContinued,
  writePlayerInfo,
} from "./MazeRendering.js";
import NewRoomQuestionDialog from "./NewRoomQuestionDialog.js";
import PlayerNameDialog from "./PlayerNameDialog.js";
import SoundPlayer from "./SoundPlayer.js";
import {
  clearPlayerData,
  loadPlayers,
  savePlayers,
  loadPlayerMazeData,
  savePlayerMazeData,
  loadPlayerPoints,
  savePlayerPoints,
  loadPlayerTorches,
  savePlayerTorches,
  loadPlayerTrophy,
  savePlayerTrophy,
  loadPlayerCurrentRoom,
  savePlayerCurrentRoom,
  loadPlayerVisitedRooms,
  savePlayerVisitedRoom,
} from "./StorageUtils.js";
import { MessageDialog } from "./MessageDialog.js";

// Scene sequence for narrative progression
const scenarioSequence = [
  {
    key: "splash",
    next: "encarta1",
    draw: (handleClick) => {
      return drawSplash(handleClick);
    },
  },
  {
    key: "encarta1",
    next: "encarta2",
    draw: (handleClick) => {
      return drawEncarta1(handleClick);
    },
  },
  {
    key: "encarta2",
    next: "enter",
    draw: (handleClick) => {
      return drawEncarta2(handleClick);
    },
  },
  {
    key: "enter",
    next: "startCorridor",
    draw: (handleClick, currentPlayerId) => {
      return drawCastleEntry(handleClick, currentPlayerId);
    },
  },
  {
    key: "startCorridor",
    next: "startCorridorContinued",
    draw: (handleClick) => {
      return drawStartCorridor(handleClick);
    },
  },
  {
    key: "startCorridorContinued",
    next: "maze",
    draw: (handleClick) => {
      return drawStartCorridorContinued(handleClick);
    },
  },
  {
    key: "maze",
    next: null,
    draw: (handleClick) => {
      return null;
    },
  },
  {
    key: "throneRoomEntry",
    next: "throneRoom",
    draw: (handleClick) => {
      return drawThroneRoomEntry(handleClick);
    },
  },
  {
    key: "throneRoom",
    next: "throneRoomContinued",
    draw: (handleClick) => {
      return drawThroneRoom(handleClick);
    },
  },
  {
    key: "throneRoomContinued",
    next: "splash",
    draw: (handleClick) => {
      return drawThroneRoomContinued(handleClick);
    },
  },
];

// Generates a unique ID for a player
const generatePlayerId = () => {
  return `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Constants and defaults
const DEFAULT_AUDIO_VOLUME = 0.25;
const INITIAL_AREA_OF_INTEREST = 0;
const DEFAULT_SCENARIO = "splash";
const INITIAL_TORCH_COUNT = 5;
const createInitialTorchStates = () => Array(INITIAL_TORCH_COUNT).fill(0);
const TROPHY_THRESHOLDS = {
  level1: { min: 5000, max: 10000 },
  level2: { min: 10000, max: 15000 },
  level3: { min: 15000 },
};
const TROPHY_LEVELS = {
  NONE: 0,
  ONE: 1,
  TWO: 2,
  THREE: 3,
};

const MESSAGE_DIALOG_WIDTH = 230;
const MESSAGE_DIALOG_HEIGHT = 149;
const MESSAGE_DIALOG_BUTTON_POSITION = [85, 121];
const MESSAGE_DIALOG_BUTTON_DIMENSION = [63, 19];

// Initializes new maze data
const initializeMazeData = (playerId) => {
  const maze = generateMaze();
  const sceneData = generateSceneData(maze);

  const mazeData = {
    startRoomY: maze.startRoomY,
    endRoomY: maze.endRoomY,
    startRoomX: maze.startRoomX,
    endRoomX: maze.endRoomX,
    sceneData: sceneData,
  };

  savePlayerMazeData(playerId, mazeData);
  return mazeData;
};

export default function Game() {
  // Global game state
  const [settingsPanelToggleHover, setSettingsPanelToggleHover] =
    useState(false);
  const [musicFiles, setMusicFiles] = useState(["/sounds/music/intro.mp3"]);
  const questionMusicFiles = useMemo(() => ["/sounds/music/question.mp3"], []);

  const [footstepSoundFile, setFootstepSoundFile] = useState(null);
  const [torchSoundFile, setTorchSoundFile] = useState(null);

  const [musicVolume, setMusicVolume] = useState(DEFAULT_AUDIO_VOLUME);
  const [effectsVolume, setEffectsVolume] = useState(DEFAULT_AUDIO_VOLUME);

  const [settingsPanelOn, setSettingsPanelOn] = useState(false);
  const [swishSoundFiles, setSwishSoundFiles] = useState(null);

  // Player-scoped game state
  const [areaOfInterest, setAreaOfInterest] = useState(
    INITIAL_AREA_OF_INTEREST,
  );
  const [cursor, setCursor] = useState(null);
  const [floorNumber, setFloorNumber] = useState(INITIAL_AREA_OF_INTEREST);
  const [minimap, setMinimap] = useState(null);
  const [questionLevel, setQuestionLevel] = useState(INITIAL_AREA_OF_INTEREST);
  const [scenario, setScenario] = useState(DEFAULT_SCENARIO);
  const [scene, setScene] = useState(null);

  // Player management state
  const [players, setPlayers] = useState(() => loadPlayers());
  const [currentPlayerName, setCurrentPlayerName] = useState(null);
  const [currentPlayerId, setCurrentPlayerId] = useState(null);
  const [showPlayerNameDialog, setShowPlayerNameDialog] = useState(false);
  const [showPlayerSelectionUI, setShowPlayerSelectionUI] = useState(false);

  // More player-scoped game state
  const [mazeData, setMazeData] = useState(() => {
    if (currentPlayerId) {
      return loadPlayerMazeData(currentPlayerId);
    }
    return null;
  });

  const [visitedRooms, setVisitedRooms] = useState(() => {
    if (currentPlayerId) {
      return loadPlayerVisitedRooms(currentPlayerId);
    }
    return null;
  });

  const [currentRoom, setCurrentRoom] = useState(() => {
    if (currentPlayerId) {
      return loadPlayerCurrentRoom(currentPlayerId);
    }
    return null;
  });

  const [previousRoom, setPreviousRoom] = useState(() => {
    if (currentPlayerId) {
      return loadPlayerCurrentRoom(currentPlayerId);
    }
    return null;
  });

  const [activeTorchTimer, setActiveTorchTimer] = useState(false);

  const [torchStates, setTorchStates] = useState(() => {
    if (currentPlayerId) {
      const value = loadPlayerTorches(currentPlayerId);
      if (value !== null) {
        return value;
      }
    }
    return [0, 0, 0, 0, 0];
  });

  const [points, setPoints] = useState(() => {
    if (currentPlayerId) {
      const value = loadPlayerPoints(currentPlayerId);
      if (loadPlayerMazeData(currentPlayerId) && value != null) {
        return value;
      }
    }
    return 0;
  });

  const [showTrophyMessageDialog, setShowTrophyMessageDialog] = useState(false);

  const [trophyLevel, setTrophyLevel] = useState(() => {
    if (currentPlayerId) {
      const value = loadPlayerTrophy(currentPlayerId);
      if (value !== null) {
        return value;
      }

      return 0;
    }
  });

  const [questions, setQuestions] = useState(() => {
    const generateCutoffs = (questions, cutoffRanges) => {
      const output = [[], [], [], []];
      for (const question of questions) {
        for (let i = 0; i < cutoffRanges.length; ++i) {
          const a = cutoffRanges[i].start;
          const b = cutoffRanges[i].end;
          if (a <= question.difficulty && question.difficulty < b) {
            output[i].push(question);
            break;
          }
        }
      }

      return output;
    };

    const value = new Map();
    value.set(
      "art-language-literature",
      generateCutoffs(jsonArtLanguageLiterature, [
        { start: 0, end: 28.2 },
        { start: 28.2, end: 32.5 },
        { start: 32.5, end: 37.4 },
        { start: 37.4, end: 100 },
      ]),
    );

    value.set(
      "geography",
      generateCutoffs(jsonGeography, [
        { start: 0, end: 21.8 },
        { start: 21.8, end: 27.9 },
        { start: 27.9, end: 32.9 },
        { start: 32.9, end: 100 },
      ]),
    );

    value.set(
      "history",
      generateCutoffs(jsonHistory, [
        { start: 0, end: 27.7 },
        { start: 27.7, end: 32.2 },
        { start: 32.2, end: 36.4 },
        { start: 36.4, end: 100 },
      ]),
    );

    value.set(
      "life-science",
      generateCutoffs(jsonLifeScience, [
        { start: 0, end: 22.45 },
        { start: 22.45, end: 26.5 },
        { start: 26.5, end: 30.9 },
        { start: 30.9, end: 100 },
      ]),
    );

    value.set(
      "performing-arts",
      generateCutoffs(jsonPerformingArts, [
        { start: 0, end: 26.4 },
        { start: 26.4, end: 30.8 },
        { start: 30.8, end: 35.1 },
        { start: 35.1, end: 100 },
      ]),
    );

    value.set(
      "physical-science",
      generateCutoffs(jsonPhysicalScience, [
        { start: 0, end: 24.7 },
        { start: 24.7, end: 29.8 },
        { start: 29.8, end: 33.7 },
        { start: 33.7, end: 100 },
      ]),
    );

    value.set(
      "religion-philosophy",
      generateCutoffs(jsonReligionPhilosophy, [
        { start: 0, end: 26.2 },
        { start: 26.2, end: 31.2 },
        { start: 31.2, end: 36.9 },
        { start: 36.9, end: 100 },
      ]),
    );

    value.set(
      "social-science",
      generateCutoffs(jsonSocialScience, [
        { start: 0, end: 26.8 },
        { start: 26.8, end: 30.6 },
        { start: 30.6, end: 35.2 },
        { start: 35.2, end: 100 },
      ]),
    );

    value.set(
      "sports-hobbies-pets",
      generateCutoffs(jsonSportsHobbiesPets, [
        { start: 0, end: 26.2 },
        { start: 26.2, end: 29.95 },
        { start: 29.95, end: 35.575 },
        { start: 35.575, end: 100 },
      ]),
    );

    return value;
  });

  // Question modal state
  const [pendingRoomQuestionsAsked, setPendingRoomQuestionsAsked] = useState(0);
  const [pendingRoom, setPendingRoom] = useState(null);
  const [pendingRoomQuestion, setPendingRoomQuestion] = useState(null);
  const [pendingRoomRemainingTime, setPendingRoomRemainingTime] = useState(0);
  const [pendingRoomExpectedAnswer, setPendingRoomExpectedAnswer] =
    useState(null);

  const [characterSpeechBubble, setCharacterSpeechBubble] = useState(null);

  // ============================================================================
  // PLAYER MANAGEMENT HANDLERS
  // ============================================================================

  const handleCreatePlayer = (newPlayerName) => {
    const newPlayerId = generatePlayerId();
    const newPlayer = {
      id: newPlayerId,
      name: newPlayerName,
      createdAt: new Date().toISOString(),
    };

    const updatedPlayers = [...players, newPlayer];
    setPlayers(updatedPlayers);
    savePlayers(updatedPlayers);

    setCurrentPlayerName(newPlayerName);
    setCurrentPlayerId(newPlayerId);
    setShowPlayerNameDialog(false);
  };

  const handleSelectPlayer = (playerId) => {
    setCurrentPlayerId(playerId);

    const foundPlayer = players.find((value) => {
      return value.id === playerId;
    });

    if (foundPlayer) {
      setCurrentPlayerName(foundPlayer.name);
    }
  };

  const handleDeletePlayer = () => {
    if (!currentPlayerId) {
      return;
    }

    // Remove player from list and persist
    const updatedPlayers = players.filter((p) => p.id !== currentPlayerId);
    setPlayers(updatedPlayers);
    savePlayers(updatedPlayers);

    // Clear stored player-specific data
    clearPlayerData(currentPlayerId);
    localStorage.removeItem(`player_${currentPlayerId}_points`);
    localStorage.removeItem(`player_${currentPlayerId}_trophy`);
    localStorage.removeItem(`player_${currentPlayerId}_visitedRooms`);

    // Reset current player selection
    setCurrentPlayerId(null);
    setCurrentPlayerName(null);
  };

  // ============================================================================
  // GAME STATE HELPERS (player-scoped)
  // ============================================================================

  const clearPendingRoomAttempt = () => {
    setPendingRoom(null);
    setPendingRoomQuestion(null);
    setPendingRoomExpectedAnswer(null);
    setPendingRoomRemainingTime(0);
  };

  const getRandomQuestion = () => {
    const index =
      areaOfInterest > 0
        ? areaOfInterest
        : getRandomArrayEntry([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    switch (index) {
      case 1:
        return getRandomArrayEntry(
          questions.get("social-science")[questionLevel],
        );
      case 2:
        return getRandomArrayEntry(
          questions.get("life-science")[questionLevel],
        );
      case 3:
        return getRandomArrayEntry(
          questions.get("religion-philosophy")[questionLevel],
        );
      case 4:
        return getRandomArrayEntry(questions.get("geography")[questionLevel]);
      case 5:
        return getRandomArrayEntry(
          questions.get("art-language-literature")[questionLevel],
        );
      case 6:
        return getRandomArrayEntry(questions.get("history")[questionLevel]);
      case 7:
        return getRandomArrayEntry(
          questions.get("performing-arts")[questionLevel],
        );
      case 8:
        return getRandomArrayEntry(
          questions.get("physical-science")[questionLevel],
        );
      case 9:
        return getRandomArrayEntry(
          questions.get("sports-hobbies-pets")[questionLevel],
        );
      default:
        return null;
    }
  };

  const initiatePendingRoomAttempt = (y, x) => {
    const shuffle = (array) => {
      let currentIndex = array.length;

      while (currentIndex !== 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        --currentIndex;
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex],
          array[currentIndex],
        ];
      }
    };

    const question = getRandomQuestion();
    if (!question) {
      return;
    }

    // Right answer is first in list
    // Strip style elements
    const expectedAnswer = question.answers[0]
      .replace("<i>", "")
      .replace("</i>", "");
    // Randomize answers
    const shuffledAnswers = [...question.answers];
    shuffle(shuffledAnswers);
    question.answers = shuffledAnswers;

    setPendingRoomQuestionsAsked((prev) => prev + 1);
    setPendingRoom({ y, x });
    setPendingRoomQuestion(question);
    setPendingRoomExpectedAnswer(expectedAnswer);

    // Stop environmental/effect sounds while question dialog is active
    setFootstepSoundFile(null);
    setTorchSoundFile(null);
  };

  const handleRoomQuestionClose = (status, level) => {
    setMusicFiles([
      "/sounds/music/1-2.mp3",
      "/sounds/music/1-3.mp3",
      "/sounds/music/2-1.mp3",
      "/sounds/music/2-3.mp3",
      "/sounds/music/3-1.mp3",
      "/sounds/music/3-2.mp3",
      "/sounds/music/bgloop1.mp3",
      "/sounds/music/bgloop2.mp3",
      "/sounds/music/bgloop3.mp3",
    ]);

    clearPendingRoomAttempt();
    if (!status) {
      return;
    }

    const pointsScalar = level + 1;
    const receivedPoints = pendingRoomRemainingTime * pointsScalar;
    const newPoints = points + receivedPoints;
    savePlayerPoints(currentPlayerId, newPoints);
    setPoints(newPoints);

    // Perform the room change
    if (
      !visitedRooms.some((v) => v.y === pendingRoom.y && v.x === pendingRoom.x)
    ) {
      // Use functional update to avoid read-modify-write races
      setVisitedRooms((prev) => {
        if (!prev) {
          savePlayerVisitedRoom(currentPlayerId, pendingRoom.y, pendingRoom.x);
          return [{ y: pendingRoom.y, x: pendingRoom.x }];
        }
        if (prev.some((v) => v.y === pendingRoom.y && v.x === pendingRoom.x)) {
          return prev;
        }
        savePlayerVisitedRoom(currentPlayerId, pendingRoom.y, pendingRoom.x);
        return [...prev, { y: pendingRoom.y, x: pendingRoom.x }];
      });
    }
    savePlayerCurrentRoom(currentPlayerId, pendingRoom.y, pendingRoom.x);

    setPreviousRoom(currentRoom);
    setCurrentRoom({ y: pendingRoom.y, x: pendingRoom.x });
  };

  const handleRoomQuestionTimeTick = (remainingTime) => {
    setPendingRoomRemainingTime(remainingTime);
    if (remainingTime === 0) {
      if (pendingRoom) {
        clearPendingRoomAttempt();
      }
    }
  };

  const handleTorchClick = (index) => {
    if (torchStates[index] > 0 || activeTorchTimer) {
      return;
    }

    const newTorchStates = [...torchStates];
    newTorchStates[index] = 1;

    savePlayerTorches(currentPlayerId, newTorchStates);
    setTorchStates(newTorchStates);

    setActiveTorchTimer(true);
  };

  const handleTorchTimeTick = (remainingTime) => {
    if (remainingTime !== 0) {
      return;
    }

    const newTorchStates = [...torchStates];

    let i = 0;
    for (; i < newTorchStates.length; ++i) {
      if (newTorchStates[i] === 1) {
        break;
      }
    }

    if (i < newTorchStates.length) {
      newTorchStates[i] = 2;

      savePlayerTorches(currentPlayerId, newTorchStates);
      setTorchStates(newTorchStates);
    }

    setActiveTorchTimer(false);
  };

  const triggerFloorChangeImpl = () => {
    setActiveTorchTimer(false);
    setTorchStates(createInitialTorchStates());
    setMazeData(null);
    setVisitedRooms(null);
    setPreviousRoom(null);
    setCurrentRoom(null);
    clearPlayerData(currentPlayerId);

    if (points >= gameConfig.POINTS_VICTORY) {
      setScenario("throneRoomEntry");
    } else {
      setFloorNumber((floorNumber) => floorNumber + 1);
    }
  };

  useEffect(() => {}, [areaOfInterest]);

  // Handle scenario changes
  useEffect(() => {
    // Set splash variables
    if (scenario === "splash") {
      setMusicFiles(["/sounds/music/intro.mp3"]);
    } else if (scenario === "encarta2") {
      // Done with explanation blurb
      const splashScenario = scenarioSequence.find((e) => e.key === "splash");
      splashScenario.next = "enter";
    }

    // Set selection UI when entering "enter" scenario
    setShowPlayerSelectionUI(scenario === "enter");

    // Set throne room variables
    if (scenario?.includes("throneRoom")) {
      const playerIdToClear = currentPlayerId;
      setCurrentPlayerId(null);
      if (playerIdToClear) {
        clearPlayerData(playerIdToClear);
      }

      if (scenario === "throneRoomEntry") {
        setMusicFiles(["/sounds/music/g-final.mp3"]);
      } else if (scenario === "throneRoomContinued") {
        setMusicFiles(["/sounds/music/finalet.mp3"]);
      }
    }

    // Maybe resume game intro / outro
    const scenarioPanel = scenarioSequence.find((s) => s.key === scenario);

    if (scenarioPanel && scenarioPanel.key !== "maze") {
      const nextSceneHandler = () => {
        if (scenarioPanel.key === "enter") {
          currentPlayerId && setScenario(scenarioPanel.next);
        } else {
          setScenario(scenarioPanel.next);
        }
      };
      setScene(scenarioPanel.draw(nextSceneHandler, currentPlayerId));
    } else if (currentPlayerId) {
      // Set music
      setMusicFiles([
        "/sounds/music/1-2.mp3",
        "/sounds/music/1-3.mp3",
        "/sounds/music/2-1.mp3",
        "/sounds/music/2-3.mp3",
        "/sounds/music/3-1.mp3",
        "/sounds/music/3-2.mp3",
        "/sounds/music/bgloop1.mp3",
        "/sounds/music/bgloop2.mp3",
        "/sounds/music/bgloop3.mp3",
      ]);

      const storedMazeData = loadPlayerMazeData(currentPlayerId);
      if (!storedMazeData) {
        // Start new game
        setMazeData(initializeMazeData(currentPlayerId));
      } else {
        // Reload game in-progress
        setMazeData(storedMazeData);
        setVisitedRooms(loadPlayerVisitedRooms(currentPlayerId));
        setPreviousRoom(loadPlayerCurrentRoom(currentPlayerId));
        setCurrentRoom(loadPlayerCurrentRoom(currentPlayerId));

        const torches = loadPlayerTorches(currentPlayerId);
        setTorchStates(torches || createInitialTorchStates());

        const playerPoints = loadPlayerPoints(currentPlayerId);
        setPoints(playerPoints || 0);

        const playerTrophyLevel = loadPlayerTrophy(currentPlayerId);
        setTrophyLevel(playerTrophyLevel || 0);
      }
    }
  }, [currentPlayerId, scenario]);

  useEffect(() => {
    if (floorNumber === 0 || !currentPlayerId) {
      return;
    }

    const newMazeData = initializeMazeData(currentPlayerId);
    setMazeData(newMazeData);

    const y = newMazeData.startRoomY;
    const x = newMazeData.startRoomX;

    savePlayerVisitedRoom(currentPlayerId, y, x);
    setVisitedRooms([{ y, x }]);

    savePlayerCurrentRoom(currentPlayerId, y, x);

    setPreviousRoom(currentRoom);
    setCurrentRoom({ y, x });
  }, [currentPlayerId, floorNumber]);

  useEffect(() => {
    if (!mazeData) {
      return;
    }

    if (visitedRooms) {
      setMinimap(() => {
        return drawMazeProgress(mazeData, visitedRooms);
      });
    } else if (currentPlayerId) {
      const y = mazeData.startRoomY;
      const x = mazeData.startRoomX;
      savePlayerVisitedRoom(currentPlayerId, y, x);
      setVisitedRooms([{ y, x }]);
    }
  }, [currentPlayerId, mazeData, visitedRooms]);

  useEffect(() => {
    // Goes to next room
    const triggerRoomChange = (y, x) => {
      // Check if this is a new room that hasn't been visited
      const isNewRoom = !visitedRooms.some((v) => v.y === y && v.x === x);

      if (isNewRoom) {
        // Show modal for new room transition
        initiatePendingRoomAttempt(y, x, questionLevel);
      } else {
        // Proceed directly for already visited rooms
        changeRoom(y, x);
      }
    };

    // Performs the room change
    const changeRoom = (y, x) => {
      if (!currentPlayerId) {
        return;
      }

      setVisitedRooms((prev) => {
        if (prev.some((v) => v.y === y && v.x === x)) {
          return prev;
        }
        savePlayerVisitedRoom(currentPlayerId, y, x);
        return [...prev, { y: y, x: x }];
      });

      savePlayerCurrentRoom(currentPlayerId, y, x);

      setPreviousRoom(currentRoom);
      setCurrentRoom({ y: y, x: x });
    };

    // Goes to next floor
    const triggerFloorChange = (y, x) => {
      if (!mazeData || !currentPlayerId) {
        return;
      }

      if (y === mazeData.endRoomY && x === mazeData.endRoomX) {
        if (
          points >= TROPHY_THRESHOLDS.level1.min &&
          points < TROPHY_THRESHOLDS.level1.max &&
          trophyLevel < TROPHY_LEVELS.ONE
        ) {
          savePlayerTrophy(currentPlayerId, TROPHY_LEVELS.ONE);
          setTrophyLevel(TROPHY_LEVELS.ONE);
          setShowTrophyMessageDialog(true);
        } else if (
          points >= TROPHY_THRESHOLDS.level2.min &&
          points < TROPHY_THRESHOLDS.level2.max &&
          trophyLevel < TROPHY_LEVELS.TWO
        ) {
          savePlayerTrophy(currentPlayerId, TROPHY_LEVELS.TWO);
          setTrophyLevel(TROPHY_LEVELS.TWO);
          setShowTrophyMessageDialog(true);
        } else if (
          points >= TROPHY_THRESHOLDS.level3.min &&
          trophyLevel < TROPHY_LEVELS.THREE
        ) {
          savePlayerTrophy(currentPlayerId, TROPHY_LEVELS.THREE);
          setTrophyLevel(TROPHY_LEVELS.THREE);
          setShowTrophyMessageDialog(true);
        } else {
          triggerFloorChangeImpl();
        }
      }
    };

    // Triggers character speech bubble
    const triggerCharacterToggle = (character) => {
      if (character === null) {
        setCharacterSpeechBubble(null);
        return;
      }

      switch (character) {
        case "alchemist": {
          setCharacterSpeechBubble(
            getRandomArrayEntry([
              "alchemist1",
              "alchemist2",
              "alchemist3",
              "alchemist4",
              "alchemist5",
            ]),
          );
          break;
        }

        case "beheading": {
          setCharacterSpeechBubble(
            getRandomArrayEntry(["beheading1", "beheading2", "beheading3"]),
          );
          break;
        }

        case "geisha": {
          setCharacterSpeechBubble(
            getRandomArrayEntry(["geisha1", "geisha2", "geisha3", "geisha4"]),
          );
          break;
        }

        case "jackInBox": {
          setCharacterSpeechBubble(
            getRandomArrayEntry([
              "jackInBox1",
              "jackInBox2",
              "jackInBox3",
              "jackInBox4",
            ]),
          );
          break;
        }

        case "jester": {
          setCharacterSpeechBubble(
            getRandomArrayEntry(["jester1", "jester2", "jester3", "jester4"]),
          );
          break;
        }

        case "king": {
          setCharacterSpeechBubble(
            getRandomArrayEntry(["king1", "king2", "king3", "king4"]),
          );
          break;
        }

        case "knight": {
          setCharacterSpeechBubble(
            getRandomArrayEntry(["knight1", "knight2", "knight3", "knight4"]),
          );
          break;
        }

        case "maid": {
          setCharacterSpeechBubble(
            getRandomArrayEntry(["maid1", "maid2", "maid3", "maid4"]),
          );
          break;
        }

        case "parade": {
          setCharacterSpeechBubble(
            getRandomArrayEntry(["parade1", "parade2", "parade3", "parade4"]),
          );
          break;
        }

        case "parrot": {
          setCharacterSpeechBubble(
            getRandomArrayEntry(["parrot1", "parrot2", "parrot3", "parrot4"]),
          );
          break;
        }

        case "princess": {
          setCharacterSpeechBubble(
            getRandomArrayEntry([
              "princess1",
              "princess2",
              "princess3",
              "princess4",
              "princess5",
            ]),
          );
          break;
        }

        case "saracen": {
          setCharacterSpeechBubble(
            getRandomArrayEntry([
              "saracen1",
              "saracen2",
              "saracen3",
              "saracen4",
            ]),
          );
          break;
        }

        case "scoundrel": {
          setCharacterSpeechBubble(
            getRandomArrayEntry([
              "scoundrel1",
              "scoundrel2",
              "scoundrel3",
              "scoundrel4",
              "scoundrel5",
            ]),
          );
          break;
        }

        case "boy": {
          setCharacterSpeechBubble(
            getRandomArrayEntry(["boy1", "boy2", "boy3", "boy4"]),
          );
          break;
        }

        case "witch": {
          setCharacterSpeechBubble(
            getRandomArrayEntry(["witch1", "witch2", "witch3", "witch4"]),
          );
          break;
        }

        default: {
          break;
        }
      }
    };

    if (!mazeData) {
      return;
    }

    if (!currentRoom) {
      const y = mazeData.startRoomY;
      const x = mazeData.startRoomX;
      savePlayerCurrentRoom(currentPlayerId, y, x);
      setPreviousRoom(currentRoom);
      setCurrentRoom({ y, x });
    }

    if (currentRoom) {
      // Render room
      setScene(
        drawRoom(
          currentRoom,
          mazeData,
          triggerRoomChange,
          triggerFloorChange,
          triggerCharacterToggle,
          characterSpeechBubble,
        ),
      );
      // Render cursor
      setCursor(drawMazeCursor(currentRoom));
    }
  }, [
    areaOfInterest,
    characterSpeechBubble,
    currentPlayerId,
    currentRoom,
    mazeData,
    pendingRoom,
    points,
    questionLevel,
    visitedRooms,
  ]);

  // Play sound on room transition
  useEffect(() => {
    if (
      currentRoom &&
      previousRoom &&
      (currentRoom.x !== previousRoom.x || currentRoom.y !== previousRoom.y)
    ) {
      if (footstepSoundFile === null) {
        const sound = getRandomArrayEntry([
          "/sounds/effects/footsteps1.mp3",
          "/sounds/effects/footsteps2.mp3",
          "/sounds/effects/footsteps3.mp3",
          "/sounds/effects/footsteps4.mp3",
          "/sounds/effects/footsteps5.mp3",
        ]);

        setFootstepSoundFile(sound);
      }
    }
  }, [currentRoom, previousRoom]);

  // Play sound on torch transition
  useEffect(() => {
    if (activeTorchTimer) {
      // Torch started
      setTorchSoundFile("/sounds/effects/torch.mp3");
    } else {
      // Torch fizzled
      const newTorchStates = [...torchStates];
      let i = 0;
      for (; i < newTorchStates.length; ++i) {
        if (newTorchStates[i] === 2) {
          break;
        }
      }

      if (i < newTorchStates.length) {
        newTorchStates[i] = 3;
        savePlayerTorches(currentPlayerId, newTorchStates);
        setTorchStates(newTorchStates);

        setTorchSoundFile("/sounds/effects/fizzle.mp3");
      }
    }
  }, [activeTorchTimer, currentPlayerId, torchStates]);

  const effectiveMinimap = activeTorchTimer
    ? drawEntireMinimap(mazeData)
    : minimap;

  // Stable callbacks for sound shot completion to avoid re-creating functions
  const handleFootstepShotFinish = useCallback(() => {
    setFootstepSoundFile(null);
  }, []);

  const handleTorchShotFinish = useCallback(() => {
    setTorchSoundFile(null);
  }, []);

  const handleSwishFinish = useCallback(() => {
    setSwishSoundFiles(null);
  }, []);

  // ============================================================================
  // PLAYER SELECTION UI
  // ============================================================================
  // STYLE CONSTANTS
  // ============================================================================

  const PLAYER_SELECTION_LIST_STYLES = {
    position: "absolute",
    fontSize: "12px",
    height: "96px",
    left: "472px",
    top: "313px",
    width: "141px",
    zIndex: 2000,
  };

  const PLAYER_SELECTION_BUTTON_STYLES = {
    borderWidth: "1px",
    color: "#34322d",
    cursor: "pointer",
    fontSize: "10px",
    position: "absolute",
    top: "292px",
    zIndex: 2000,
  };

  const NEW_PLAYER_BUTTON_STYLES = {
    ...PLAYER_SELECTION_BUTTON_STYLES,
    left: "472px",
    width: "78px",
  };

  const DELETE_PLAYER_BUTTON_STYLES = {
    ...PLAYER_SELECTION_BUTTON_STYLES,
    left: "558px",
    width: "55px",
  };

  const TORCH_TIMER_STYLES = {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: "12px",
    padding: "8px",
    position: "absolute",
    right: "12px",
    top: "30px",
    zIndex: 2000,
  };

  const SCENE_CONTAINER_STYLES = {
    position: "absolute",
  };

  const SCENE_IMG_STYLE = {
    position: "absolute",
  };

  const CONTROL_PANEL_STYLES = {
    background: "rgba(255, 255, 255, 0.6)",
    height: "100vh",
    left: "0",
    position: "absolute",
    top: "0",
    zIndex: 3000,
  };

  const CONTROL_PANEL_CLOSE_STYLES = {
    padding: "1px",
  };

  const CONTROL_TABLE_STYLES = {
    padding: `${uiConfig.controlTable.padding}px`,
    width: "100%",
  };

  const CONTROL_TD_TOP_STYLES = {
    verticalAlign: "top",
    height: `${uiConfig.controlTable.rowHeight}px`,
  };

  const CONTROL_TD_MIDDLE_STYLES = {
    verticalAlign: "middle",
    height: `${uiConfig.controlTable.rowHeight}px`,
  };

  const SETTINGS_BUTTON_STYLES = {
    background: settingsPanelToggleHover ? "rgba(0 ,0, 0, 0.25)" : "none",
    border: "none",
    borderRadius: "0",
    cursor: "pointer",
    height: "16px",
    left: "1px",
    padding: "0",
    position: "absolute",
    textAlign: "center",
    top: "1px",
    width: "16px",
    zIndex: "2000",
  };

  const SETTINGS_BUTTON_IMAGE_STYLES = {
    height: "15px",
    width: "15px",
  };

  // ============================================================================

  const PlayerSelectionUI = () => {
    if (showPlayerNameDialog) {
      return null;
    }

    return (
      <div>
        <button
          style={NEW_PLAYER_BUTTON_STYLES}
          onClick={() => {
            setShowPlayerNameDialog(true);
          }}
        >
          New Player
        </button>
        <button
          style={DELETE_PLAYER_BUTTON_STYLES}
          onClick={() => {
            handleDeletePlayer();
          }}
        >
          Delete
        </button>
        {players.length > 0 && (
          <select
            size="8"
            style={PLAYER_SELECTION_LIST_STYLES}
            defaultValue={currentPlayerId}
            onChange={(e) => handleSelectPlayer(e.target.value)}
          >
            {players.map((player, index) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  };

  return (
    <div>
      {settingsPanelOn && (
        <div style={CONTROL_PANEL_STYLES}>
          <div style={CONTROL_PANEL_CLOSE_STYLES}>
            <button
              style={CLOSE_BUTTON_STYLES}
              onClick={() => {
                setSettingsPanelOn(false);
              }}
            >
              🗙
            </button>
          </div>
          <div>
            <table style={CONTROL_TABLE_STYLES}>
              <tbody>
                <tr>
                  <td style={CONTROL_TD_TOP_STYLES}>Music</td>
                  <td style={CONTROL_TD_MIDDLE_STYLES}>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={musicVolume}
                      onChange={(e) =>
                        setMusicVolume(parseFloat(e.target.value))
                      }
                    />
                  </td>
                </tr>
                <tr>
                  <td style={CONTROL_TD_TOP_STYLES}>Sound</td>
                  <td style={CONTROL_TD_MIDDLE_STYLES}>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={effectsVolume}
                      onChange={(e) =>
                        setEffectsVolume(parseFloat(e.target.value))
                      }
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div style={sceneStyles.container}>
        <button
          alt="Sound"
          style={SETTINGS_BUTTON_STYLES}
          onClick={() => {
            if (!!!settingsPanelOn) {
              setSwishSoundFiles([
                "sounds/effects/swish1.mp3",
                "sounds/effects/swish2.mp3",
                "sounds/effects/swish3.mp3",
              ]);
            }
            setSettingsPanelOn(!settingsPanelOn);
          }}
          onMouseEnter={() => setSettingsPanelToggleHover(true)}
          onMouseLeave={() => setSettingsPanelToggleHover(false)}
        >
          <img
            style={SETTINGS_BUTTON_IMAGE_STYLES}
            src={splashAssets.settingsToggle}
          />
        </button>
        <img alt="" style={SCENE_IMG_STYLE} src={splashAssets.mindMaze} />
        {showPlayerSelectionUI && <PlayerSelectionUI />}
        {showPlayerNameDialog && (
          <PlayerNameDialog
            onSubmitName={handleCreatePlayer}
            onCancel={() => {
              setShowPlayerNameDialog(false);
            }}
          />
        )}
        {mazeData && currentPlayerId && (
          <div>
            <div style={sceneStyles.controls}>
              <img alt="" src={controlPanelAssets.minimap} />
            </div>
            {drawMinimap(
              effectiveMinimap,
              cursor,
              torchStates,
              handleTorchClick,
            )}
            {activeTorchTimer && (
              <div style={TORCH_TIMER_STYLES}>
                <CountdownTimer
                  duration={gameConfig.TORCH_DURATION}
                  onTimeTick={handleTorchTimeTick}
                  isActive={activeTorchTimer}
                />
              </div>
            )}
            {pendingRoom === null && (
              <div style={sceneStyles.controls}>
                <img alt="" src={splashAssets.questionControls} />
              </div>
            )}
            {pendingRoom === null && (
              <AreaOfInterestSelector
                areaOfInterest={areaOfInterest}
                handleSelection={(newAreaOfInterest) => {
                  setAreaOfInterest(newAreaOfInterest);
                }}
              />
            )}
            {pendingRoom === null && (
              <LevelSelector
                level={questionLevel}
                handleSelection={(newLevel) => {
                  setQuestionLevel(newLevel);
                }}
              />
            )}
            {pendingRoom === null &&
              writePlayerInfo(
                currentPlayerName,
                points,
                gameConfig.POINTS_VICTORY,
              )}
            {pendingRoom === null && trophyLevel === 1 && (
              <div style={sceneStyles.controls}>
                <img alt="" src={controlPanelAssets.trophies.level1} />
              </div>
            )}
            {pendingRoom === null && trophyLevel === 2 && (
              <div style={sceneStyles.controls}>
                <img alt="" src={controlPanelAssets.trophies.level2} />
              </div>
            )}
            {pendingRoom === null && trophyLevel === 3 && (
              <div style={sceneStyles.controls}>
                <img alt="" src={controlPanelAssets.trophies.level3} />
              </div>
            )}
          </div>
        )}
        <div style={SCENE_CONTAINER_STYLES}>{scene}</div>
        <div key={pendingRoomQuestionsAsked}>
          <NewRoomQuestionDialog
            question={pendingRoomQuestion ? pendingRoomQuestion.question : null}
            answers={pendingRoomQuestion ? pendingRoomQuestion.answers : null}
            effectsVolume={effectsVolume}
            expectedAnswer={pendingRoomExpectedAnswer}
            questionLevel={questionLevel}
            handleClose={handleRoomQuestionClose}
            onTimeTick={handleRoomQuestionTimeTick}
          />
        </div>
        {pendingRoomQuestion && (
          <SoundPlayer
            key={`question-music`}
            soundFiles={questionMusicFiles}
            volume={musicVolume}
            oneshot={false}
          />
        )}
        {showTrophyMessageDialog && (
          <MessageDialog
            width={MESSAGE_DIALOG_WIDTH}
            height={MESSAGE_DIALOG_HEIGHT}
            text="Congratulations! You now have a new award!"
            background={promptAssets.promptDialog}
            buttonPosition={MESSAGE_DIALOG_BUTTON_POSITION}
            buttonDimension={MESSAGE_DIALOG_BUTTON_DIMENSION}
            onClose={() => {
              setShowTrophyMessageDialog(false);
              triggerFloorChangeImpl();
            }}
          />
        )}
      </div>
      <SoundPlayer
        key={`${JSON.stringify(musicFiles)}`}
        soundFiles={musicFiles}
        volume={pendingRoomQuestion ? 0 : musicVolume}
        oneshot={scenario?.includes("throneRoom")}
        persistKey={"background-music"}
      />
      <div>
        {footstepSoundFile && (
          <SoundPlayer
            oneshot={true}
            soundFiles={footstepSoundFile}
            volume={effectsVolume}
            onShotFinish={handleFootstepShotFinish}
          />
        )}
      </div>
      <div>
        {torchSoundFile && (
          <SoundPlayer
            oneshot={true}
            soundFiles={torchSoundFile}
            volume={effectsVolume}
            onShotFinish={handleTorchShotFinish}
          />
        )}
      </div>
      <div>
        {swishSoundFiles && (
          <SoundPlayer
            oneshot={true}
            soundFiles={swishSoundFiles}
            volume={effectsVolume}
            onShotFinish={handleSwishFinish}
          />
        )}
      </div>
    </div>
  );
}
