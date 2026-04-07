import AssetCanvas from "./AssetCanvas.js";
import {
  controlPanelAssets,
  promptAssets,
  speechBubbleAssets,
  splashAssets,
  targetRoomAssets,
  visitedRoomAssets,
} from "./AssetMaps.js";
import { controlPanelConfig, minimapConfig, sceneStyles } from "./Constants.js";
import { getRandomArrayEntry } from "./CoordinateUtils.js";
import MaskCanvas from "./MaskCanvas.js";
import { MessageDialog } from "./MessageDialog.js";
import { goToWiki } from "./WikiUtils.js";

// ============================================================================
// STYLE CONSTANTS
// ============================================================================

const SCENARIO_IMAGE_STYLES = {
  cursor: "hand",
};

const SCENARIO_IMAGE_MASK_STYLES = {
  left: "0",
  position: "absolute",
  top: "0",
  zIndex: 1000,
};

const PLAYER_NAME_STYLES = {
  fontSize: "16px",
  fontWeight: "bold",
  left: "492px",
  overflowWrap: "break-word",
  position: "absolute",
  textAlign: "center",
  top: "326px",
  width: "140px",
  zIndex: 1000,
};

const POINTS_DISPLAY_STYLES = {
  fontSize: "12px",
  position: "absolute",
  width: "140px",
  zIndex: 1000,
};

const TORCH_BUTTON_STYLES = {
  backgroundSize: "contain",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
  borderSize: "1",
  borderRadius: "0",
  cursor: "pointer",
  height: `${controlPanelConfig.torches.size.height}px`,
  position: "absolute",
  width: `${controlPanelConfig.torches.size.width}px`,
  zIndex: 1000,
};

const SPEECH_BUBBLE_STYLES = {
  position: "absolute",
  zIndex: 2000,
};

const getTorchStyle = (pos, index, torchStates) => ({
  ...TORCH_BUTTON_STYLES,
  background: `url(${torchStates[index] > 0 ? controlPanelAssets.torchDisabled : controlPanelAssets.torch})`,
  left: `${pos.left}px`,
  top: `${pos.top}px`,
});

const getVisitedMinimapMarkerStyle = (x, y) => ({
  ...sceneStyles.minimapWidget,
  left: `calc(${minimapConfig.MARKER_LEFT_OFFSET + x * minimapConfig.MARKER_X_SCALE}px)`,
  top: `calc(${minimapConfig.MARKER_TOP_OFFSET + y * minimapConfig.MARKER_Y_SCALE}px)`,
});

const getVisitedMinimapCursorStyle = (x, y) => ({
  ...sceneStyles.minimapWidget,
  left: `calc(${minimapConfig.CURSOR_LEFT_OFFSET + x * minimapConfig.MARKER_X_SCALE}px)`,
  top: `calc(${minimapConfig.CURSOR_TOP_OFFSET + y * minimapConfig.MARKER_Y_SCALE}px)`,
});

const DEFAULT_TAB_INDEX = 0;
const SCENARIO_BUTTON_WIDTH = 230;
const SCENARIO_BUTTON_HEIGHT = 149;
const SCENARIO_BUTTON_POSITION = [85, 121];
const SCENARIO_BUTTON_DIMENSION = [63, 19];

// ============================================================================

export const drawSplash = (handleClick) => {
  return (
    <input
      type="image"
      alt=""
      src={splashAssets.splash}
      onKeyDown={() => {}}
      tabIndex={DEFAULT_TAB_INDEX}
      style={SCENARIO_IMAGE_STYLES}
      onClick={(e) => {
        e.preventDefault();
        handleClick();
      }}
    />
  );
};

export const drawEncarta1 = (handleClick) => {
  return (
    <input
      type="image"
      alt=""
      src={splashAssets.encarta1}
      onKeyDown={() => {}}
      tabIndex={DEFAULT_TAB_INDEX}
      style={SCENARIO_IMAGE_STYLES}
      onClick={(e) => {
        e.preventDefault();
        handleClick();
      }}
    />
  );
};

export const drawEncarta2 = (handleClick) => {
  return (
    <input
      type="image"
      alt=""
      src={splashAssets.encarta2}
      onKeyDown={() => {}}
      tabIndex={DEFAULT_TAB_INDEX}
      style={SCENARIO_IMAGE_STYLES}
      onClick={(e) => {
        e.preventDefault();
        handleClick();
      }}
    />
  );
};

export const drawCastleEntry = (handleClick, currentPlayerId) => {
  const shouldHandleMouseOver = currentPlayerId ? true : false;
  return (
    <div>
      <MessageDialog
        width={SCENARIO_BUTTON_WIDTH}
        height={SCENARIO_BUTTON_HEIGHT}
        text={
          "Who dares enter the castle MindMaze? Choose a name from the list."
        }
        background={promptAssets.promptDialog}
        buttonPosition={SCENARIO_BUTTON_POSITION}
        buttonDimension={SCENARIO_BUTTON_DIMENSION}
      />
      <MaskCanvas
        maskAsset={splashAssets.enterMask}
        sceneAsset={splashAssets.enter}
        shouldHandleMouseOver={shouldHandleMouseOver}
        clickHandler={(status) => {
          if (status) {
            handleClick();
          }
        }}
        style={SCENARIO_IMAGE_MASK_STYLES}
      />
    </div>
  );
};

export const drawStartCorridor = (handleClick) => {
  return (
    <div>
      <MaskCanvas
        maskAsset={splashAssets.startCorridorMask}
        sceneAsset={splashAssets.startCorridor}
        shouldHandleMouseOver={true}
        clickHandler={(status) => {
          if (status) {
            handleClick();
          }
        }}
        style={SCENARIO_IMAGE_MASK_STYLES}
      />
    </div>
  );
};

export const drawStartCorridorContinued = (handleClick) => {
  return (
    <div>
      <MaskCanvas
        maskAsset={splashAssets.startCorridorContinuedMask}
        sceneAsset={splashAssets.startCorridorContinued}
        shouldHandleMouseOver={true}
        clickHandler={(status) => {
          if (status) {
            handleClick();
          }
        }}
        style={SCENARIO_IMAGE_MASK_STYLES}
      />
    </div>
  );
};

export const drawThroneRoomEntry = (handleClick) => {
  return (
    <input
      type="image"
      alt=""
      src={splashAssets.throneRoomEntry}
      onKeyDown={() => {}}
      tabIndex={DEFAULT_TAB_INDEX}
      style={SCENARIO_IMAGE_STYLES}
      onClick={(e) => {
        e.preventDefault();
        handleClick();
      }}
    />
  );
};

export const drawThroneRoom = (handleClick) => {
  return (
    <input
      type="image"
      alt=""
      src={splashAssets.throneRoom}
      onKeyDown={() => {}}
      tabIndex={DEFAULT_TAB_INDEX}
      style={SCENARIO_IMAGE_STYLES}
      onClick={(e) => {
        e.preventDefault();
        handleClick();
      }}
    />
  );
};

export const drawThroneRoomContinued = (handleClick) => {
  return (
    <input
      type="image"
      alt=""
      src={splashAssets.throneRoomContinued}
      onKeyDown={() => {}}
      tabIndex={DEFAULT_TAB_INDEX}
      style={SCENARIO_IMAGE_STYLES}
      onClick={(e) => {
        e.preventDefault();
        handleClick();
      }}
    />
  );
};

export const writePlayerInfo = (playerName, points, victoryPoints) => {
  const writePlayerName = () => {
    return <div style={PLAYER_NAME_STYLES}>{playerName}</div>;
  };

  const writePoints = () => {
    const pointsStyle = {
      ...POINTS_DISPLAY_STYLES,
      left: `${controlPanelConfig.pointsPosition.left}px`,
      top: `${controlPanelConfig.pointsPosition.top}px`,
    };
    return (
      <div style={pointsStyle}>
        Progress: {points}/{victoryPoints}
      </div>
    );
  };

  return (
    <div>
      <div>{writePlayerName()}</div>
      <div>{writePoints()}</div>
    </div>
  );
};

export const drawMinimap = (
  mazeProgress,
  cursor,
  torchStates,
  onTorchClick,
) => {
  const drawTorches = () =>
    controlPanelConfig.torches.positions.map((pos, index) => (
      <input
        key={`torch-${index}`}
        alt=""
        disabled={torchStates[index] > 0}
        type="image"
        style={getTorchStyle(pos, index, torchStates)}
        onKeyDown={() => {}}
        onClick={(e) => {
          e.preventDefault();
          if (torchStates[index] === 0 && onTorchClick) {
            onTorchClick(index);
          }
        }}
        onMouseEnter={(e) => {
          if (torchStates[index] === 0)
            e.target.style.background = `url(${controlPanelAssets.torchHover}) no-repeat`;
        }}
        onMouseLeave={(e) => {
          e.target.style.background =
            torchStates[index] > 0
              ? `url(${controlPanelAssets.torchDisabled}) no-repeat`
              : `url(${controlPanelAssets.torch}) no-repeat`;
        }}
      />
    ));

  return (
    <div>
      <div>{drawTorches()}</div>
      <div>{mazeProgress}</div>
      <div>{cursor}</div>
    </div>
  );
};

const drawVisitedMinimapMarker = (doors, y, x, target = false) => {
  const src = target ? targetRoomAssets[doors] : visitedRoomAssets[doors];

  return (
    <img
      key={`visited-room-minimap-marker-${x},${y}`}
      alt=""
      style={getVisitedMinimapMarkerStyle(x, y)}
      src={src}
    />
  );
};

const drawRoomImpl = (
  sceneData,
  handleDoorClick,
  handleStaircaseClick,
  handleCharacterToggle,
  characterSpeechBubble,
) => {
  const {
    y,
    x,
    wall,
    floor,
    doors,
    masks,
    characters,
    doodads,
    leftFrame,
    rightFrame,
  } = sceneData;

  const wallAssets = [];
  const floorAssets = [];
  const doorAssets = [];
  const maskAssets = masks || [];
  const characterAssets = characters || [];
  const doodadAssets = doodads || [];
  const frameAssets = [];

  if (doors) {
    doors.split("").forEach((door) => {
      doorAssets.push(door);
    });
  }

  if (wall) {
    wallAssets.push(wall);
  }

  if (floor) {
    floorAssets.push(floor);
  }

  if (leftFrame) {
    frameAssets.push(leftFrame);
  }

  if (rightFrame) {
    frameAssets.push(rightFrame);
  }

  // Map door directions to their target coordinates
  const getClickHandler = (direction) => {
    const directionToCoords = {
      staircase: () => handleStaircaseClick(y, x),
      L: () => handleDoorClick(y, x - 1),
      U: () => handleDoorClick(y - 1, x),
      S: () => handleDoorClick(y - 1, x), // Special case for stairs
      R: () => handleDoorClick(y, x + 1),
      D: () => handleDoorClick(y + 1, x),
      alchemist: () => {
        handleCharacterToggle("alchemist");
      },
      beheading: () => {
        handleCharacterToggle("beheading");
      },
      geisha: () => {
        handleCharacterToggle("maid");
      },
      jackInBox: () => {
        handleCharacterToggle("jackInBox");
      },
      jesterHanging: () => {
        handleCharacterToggle("jester");
      },
      jesterLaughing: () => {
        handleCharacterToggle("jester");
      },
      jester: () => {
        handleCharacterToggle("jester");
      },
      king: () => {
        handleCharacterToggle("king");
      },
      kingStone: () => {
        handleCharacterToggle("king");
      },
      knightFar: () => {
        handleCharacterToggle("knight");
      },
      knightNear: () => {
        handleCharacterToggle("knight");
      },
      maid: () => {
        handleCharacterToggle("maid");
      },
      maidNear: () => {
        handleCharacterToggle("maid");
      },
      parade: () => {
        handleCharacterToggle("parade");
      },
      parrot: () => {
        handleCharacterToggle("parrot");
      },
      princess: () => {
        handleCharacterToggle("princess");
      },
      saracen: () => {
        handleCharacterToggle("saracen");
      },
      scoundrel: () => {
        handleCharacterToggle("scoundrel");
      },
      scoundrelFar: () => {
        handleCharacterToggle("scoundrel");
      },
      scoundrelNear: () => {
        handleCharacterToggle("scoundrel");
      },
      servantBoy: () => {
        handleCharacterToggle("boy");
      },
      waterBoy: () => {
        handleCharacterToggle("boy");
      },
      witch: () => {
        handleCharacterToggle("witch");
      },
      leftArts: () => {
        goToWiki(getRandomArrayEntry(["art", "language", "literature"]));
      },
      leftGamesSports: () => {
        goToWiki(getRandomArrayEntry(["sport", "hobby", "game"]));
      },
      leftGeography: () => {
        goToWiki("geography");
      },
      leftHistory: () => {
        goToWiki("history");
      },
      leftLifeScience: () => {
        goToWiki("life science");
      },
      leftPerformingArts: () => {
        goToWiki("performing arts");
      },
      leftPhysicalScience: () => {
        goToWiki("physical science");
      },
      leftReligionPhilosophy: () => {
        goToWiki(getRandomArrayEntry(["religion", "philosophy"]));
      },
      leftSocialScience: () => {
        goToWiki("social science");
      },
      rightArts: () => {
        goToWiki(getRandomArrayEntry(["art", "language", "literature"]));
      },
      rightGamesSports: () => {
        goToWiki(getRandomArrayEntry(["sport", "hobby", "game"]));
      },
      rightGeography: () => {
        goToWiki("geography");
      },
      rightHistory: () => {
        goToWiki("history");
      },
      rightLifeScience: () => {
        goToWiki("life science");
      },
      rightPerformingArts: () => {
        goToWiki("performing arts");
      },
      rightPhysicalScience: () => {
        goToWiki("physical science");
      },
      rightReligionPhilosophy: () => {
        goToWiki(getRandomArrayEntry(["religion", "philosophy"]));
      },
      rightSocialScience: () => {
        goToWiki("social science");
      },
    };
    return directionToCoords[direction];
  };

  return (
    <div>
      {characterSpeechBubble && (
        <img
          alt=""
          style={SPEECH_BUBBLE_STYLES}
          src={speechBubbleAssets[characterSpeechBubble]}
          onKeyDown={() => {}}
          onClick={() => {
            handleCharacterToggle(null);
          }}
        />
      )}

      <AssetCanvas
        masks={maskAssets}
        walls={wallAssets}
        floors={floorAssets}
        doors={doorAssets}
        characters={characterAssets}
        doodads={doodadAssets}
        frames={frameAssets}
        handleAssetClick={(asset) => {
          if (asset) {
            getClickHandler(asset)();
          }
        }}
      />
    </div>
  );
};

const isEndRoom = (maze, y, x) => {
  return y === maze.endRoomY && x === maze.endRoomX;
};

export const drawRoom = (
  roomCoordinates,
  maze,
  triggerRoomUpdate,
  triggerFloorUpdate,
  triggerCharacterToggle,
  characterSpeechBubble,
) => {
  const { y, x } = roomCoordinates;

  const sceneData = structuredClone(maze.sceneData[y][x]);
  const inEndRoom = isEndRoom(maze, y, x);
  if (inEndRoom) {
    sceneData.doors = sceneData.doors.replace("U", "S");
  }

  return (
    <div>
      {inEndRoom && (
        <MessageDialog
          width={SCENARIO_BUTTON_WIDTH}
          height={SCENARIO_BUTTON_HEIGHT}
          text={"Click the stairs to continue your quest."}
          background={promptAssets.promptDialog}
          buttonPosition={SCENARIO_BUTTON_POSITION}
          buttonDimension={SCENARIO_BUTTON_DIMENSION}
        />
      )}
      {drawRoomImpl(
        sceneData,
        triggerRoomUpdate,
        triggerFloorUpdate,
        triggerCharacterToggle,
        characterSpeechBubble,
      )}
    </div>
  );
};

export const drawMazeProgress = (maze, visitedRooms) => {
  const endRoomY = maze.endRoomY;
  const endRoomX = maze.endRoomX;

  const value = [];
  for (const { y, x } of visitedRooms) {
    // Will draw end room further down
    if (y === endRoomY && x === endRoomX) {
      continue;
    }

    const doors = maze.sceneData[y][x].doors;
    value.push(drawVisitedMinimapMarker(doors, y, x));
  }

  value.push(
    drawVisitedMinimapMarker(
      maze.sceneData[endRoomY][endRoomX].doors,
      endRoomY,
      endRoomX,
      true,
    ),
  );
  return value;
};

export const drawEntireMinimap = (maze) => {
  const endRoomY = maze.endRoomY;
  const endRoomX = maze.endRoomX;

  const value = [];
  for (let y = 0; y < maze.sceneData.length; ++y) {
    for (let x = 0; x < maze.sceneData[y].length; ++x) {
      // Will draw end room further down
      if (y === endRoomY && x === endRoomX) {
        continue;
      }

      const doors = maze.sceneData[y][x].doors;
      value.push(drawVisitedMinimapMarker(doors, y, x));
    }
  }

  value.push(
    drawVisitedMinimapMarker(
      maze.sceneData[endRoomY][endRoomX].doors,
      endRoomY,
      endRoomX,
      true,
    ),
  );
  return value;
};

export const drawMazeCursor = (room) => {
  const { y, x } = room;

  return (
    <img
      key={`minimap-cursor`}
      alt=""
      style={getVisitedMinimapCursorStyle(x, y)}
      src={controlPanelAssets.marker}
    />
  );
};
