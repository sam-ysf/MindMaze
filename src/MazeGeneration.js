import { characterAssets, doodadAssets, frameAssets } from "./AssetMaps.js";
import {
  collisionMap,
  gameConfig,
  wallTypes,
  wallToFloorTypes,
} from "./Constants.js";
import {
  calcNextLegalCoords,
  calcNextLegalUnvisitedCoords,
  connectRooms,
  getRandomArrayEntry,
  sortRoomDoors,
} from "./CoordinateUtils.js";

const isEndRoom = (y, x, maze) => {
  return y === maze.endRoomY && x === maze.endRoomX;
};

const isPlainFloor = (floor) => {
  return (
    floor === "plainStone" ||
    floor === "plainStoneArch" ||
    floor === "plainWhite" ||
    floor === "plainWhiteArch"
  );
};

const isCheckerboardFloor = (floor) => {
  return (
    floor === "checkerboardStone" ||
    floor === "checkerboardStoneArch" ||
    floor === "checkerboardWhite" ||
    floor === "checkerboardWhiteArch"
  );
};

const maybeTransformCharacter = (room, character) => {
  switch (character) {
    case "king": {
      return isPlainFloor(room.floor) ? "kingStone" : character;
    }

    case "kingStone": {
      return isPlainFloor(room.floor) ? character : "king";
    }

    default: {
      return character;
    }
  }
};

const canInsertCharacter = (room, character) => {
  switch (character) {
    case "alchemist": {
      return !room.doors.includes("U") && !room.doors.includes("R");
    }

    case "princess": {
      return isCheckerboardFloor(room.floor);
    }

    default: {
      return true;
    }
  }
};

const generateCharacters = (roomsGrid) => {
  // Randomly add character to each room
  const keys = Object.keys(characterAssets);

  for (let y = 0; y < roomsGrid.length; ++y) {
    for (let x = 0; x < roomsGrid[y].length; ++x) {
      if (isEndRoom(y, x, roomsGrid)) {
        continue;
      }

      const room = roomsGrid[y][x];

      const choice = Math.floor(Math.random() * keys.length);

      if (choice < keys.length) {
        const key = keys[choice];
        if (canInsertCharacter(room, key)) {
          room.characters.push(maybeTransformCharacter(room, key));
        }
      }
    }
  }
};

const generateNormalizedCollisionMap = () => {
  const normalizedCollisionMap = new Map();
  for (const key in collisionMap) {
    const value = collisionMap[key];
    if (value.length === 2) {
      normalizedCollisionMap.set(key, value);
    } else if (value.length === 1) {
      normalizedCollisionMap.set(key, [value[0], value[0]]);
    }
  }

  return normalizedCollisionMap;
};

const testCollision = (a, collisionMap, haystack) => {
  const a0 = a[0];
  const a1 = a[1];

  for (const element of haystack) {
    const b = collisionMap.get(element);
    if (!b) {
      continue;
    }

    const b0 = b[0];
    const b1 = b[1];

    const cmp1 = b0 <= a0 && a0 <= b1;
    const cmp2 = b0 <= a1 && a1 <= b1;
    const cmp3 = a0 <= b0 && b0 <= a1;
    const cmp4 = a0 <= b1 && b1 <= a1;

    if (cmp1 || cmp2 || cmp3 || cmp4) {
      return true;
    }
  }

  return false;
};

const generateDoodads = (roomsGrid) => {
  // Randomly add doodads to each room
  const keys = Object.keys(doodadAssets);
  const normalizedCollisionMap = generateNormalizedCollisionMap();

  for (let y = 0; y < roomsGrid.length; ++y) {
    for (let x = 0; x < roomsGrid[y].length; ++x) {
      if (isEndRoom(y, x, roomsGrid)) {
        continue;
      }

      const room = roomsGrid[y][x];

      for (let i = 0; i < gameConfig.DOODAD_TRYINSERT_COUNT; ++i) {
        const choice = Math.floor(Math.random() * keys.length);
        if (choice < keys.length) {
          const candidate = keys[choice];

          const collision = testCollision(
            normalizedCollisionMap.get(candidate),
            normalizedCollisionMap,
            [...room.doodads, ...room.characters],
          );

          if (!collision) {
            room.doodads.push(candidate);
          }
        }
      }

      const maybeAddWithProbability = (key) => {
        const collision = testCollision(
          normalizedCollisionMap.get(key),
          normalizedCollisionMap,
          [...room.doodads, ...room.characters],
        );

        if (!collision && Math.floor(Math.random() * 3) === 2) {
          room.doodads.push(key);
        }
      };

      maybeAddWithProbability("flag");
      maybeAddWithProbability("gobletShelf");
      maybeAddWithProbability("candleHanging");
      maybeAddWithProbability("banner");
    }
  }
};

const sliceInHalf = (array) => {
  const length = array.length;
  const dividor = Math.floor(length / 2);

  return [array.slice(0, dividor), array.slice(dividor, length)];
};

const generatePictureFramesLeft = (roomsGrid, frameKeys, collisionMap) => {
  for (let y = 0; y < roomsGrid.length; ++y) {
    for (let x = 0; x < roomsGrid[y].length; ++x) {
      if (isEndRoom(y, x, roomsGrid)) {
        continue;
      }

      const room = roomsGrid[y][x];

      if (!room.doodads.includes("pictureFrameLeft")) {
        const collision = testCollision(
          collisionMap.get("pictureFrameLeft"),
          collisionMap,
          [...room.doodads, ...room.characters],
        );

        if (!collision && Math.floor(Math.random() * 2) > 0) {
          room.doodads.push("pictureFrameLeft");
        }
      }

      if (room.doodads.includes("pictureFrameLeft")) {
        const choice = Math.floor(Math.random() * (frameKeys.length - 1));
        room.leftFrame = frameKeys[choice];
      }
    }
  }
};

const generatePictureFramesRight = (roomsGrid, frameKeys) => {
  for (let y = 0; y < roomsGrid.length; ++y) {
    for (let x = 0; x < roomsGrid[y].length; ++x) {
      if (isEndRoom(y, x, roomsGrid)) {
        continue;
      }

      const room = roomsGrid[y][x];

      const choice = Math.floor(Math.random() * (frameKeys.length - 1));
      room.rightFrame = frameKeys[choice];
    }
  }
};

const spliceMaze = (roomsGrid, mazeDimension, spliceInterval) => {
  // Maybe add random entrances (splice) between rooms
  for (let y = 0; y < mazeDimension; ++y) {
    for (let x = 0; x < mazeDimension; ++x) {
      let shouldSplice = false;
      if ((y * roomsGrid.length + x) % spliceInterval === 0) {
        shouldSplice = Math.floor(Math.random() * roomsGrid.length) % 2 === 0;
      }

      if (!shouldSplice) {
        continue;
      }

      const next = calcNextLegalCoords(y, x, mazeDimension);

      // Sanity check
      if (next === null) {
        continue;
      }

      const [y1, x1] = next;
      connectRooms(y, x, y1, x1, roomsGrid);
    }
  }
};

export const generateMaze = (
  mazeDimension = gameConfig.MAZE_DIMENSION,
  spliceInterval = gameConfig.SPLICE_INTERVAL,
) => {
  const startRoom = Math.floor(Math.random() * (mazeDimension * mazeDimension));
  const startRoomX = startRoom % mazeDimension;
  const startRoomY = Math.floor(startRoom / mazeDimension);

  // Visit starting room
  const unfinishedVisits = [[startRoomY, startRoomX]];
  const visits = [[startRoomY, startRoomX]];

  const roomsGrid = new Array(mazeDimension);
  for (let row = 0; row < mazeDimension; ++row) {
    roomsGrid[row] = new Array(mazeDimension);
    for (let col = 0; col < mazeDimension; ++col) {
      roomsGrid[row][col] = {
        y: row,
        x: col,
        floor: null,
        wall: null,
        doors: "",
        characters: [],
        doodads: [],
        leftFrame: null,
        rightFrame: null,
      };
    }
  }

  while (unfinishedVisits.length > 0) {
    const [y0, x0] = unfinishedVisits.at(-1);

    const next = calcNextLegalUnvisitedCoords(y0, x0, roomsGrid, mazeDimension);

    if (next === null) {
      // Can't visit any more rooms from here
      unfinishedVisits.pop();
    } else {
      const [y1, x1] = next;

      connectRooms(y0, x0, y1, x1, roomsGrid);

      visits.push([y1, x1]);
      unfinishedVisits.push([y1, x1]);
    }
  }

  const getRandomWall = () => {
    return getRandomArrayEntry(wallTypes);
  };

  const getRandomFloor = (wall) => {
    return getRandomArrayEntry(wallToFloorTypes[wall]);
  };

  // Generate random floors and walls
  for (const row of roomsGrid) {
    for (const room of row) {
      room.wall = getRandomWall();
      room.floor = getRandomFloor(room.wall);
    }
  }

  // Maybe insert additional corridors
  spliceMaze(roomsGrid, mazeDimension, spliceInterval);
  sortRoomDoors(roomsGrid);

  generateCharacters(roomsGrid);
  generateDoodads(roomsGrid);

  const [leftFrameKeys, rightFrameKeys] = sliceInHalf(Object.keys(frameAssets));
  generatePictureFramesLeft(
    roomsGrid,
    leftFrameKeys,
    generateNormalizedCollisionMap(),
  );
  generatePictureFramesRight(roomsGrid, rightFrameKeys);

  const endRoomY = visits.at(-1)[0];
  const endRoomX = visits.at(-1)[1];

  return {
    roomsGrid: roomsGrid,
    startRoomY: startRoomY,
    endRoomY: endRoomY,
    startRoomX: startRoomX,
    endRoomX: endRoomX,
  };
};

export const generateSceneData = (maze) => {
  const grid = maze.roomsGrid;
  const gridDimension = maze.roomsGrid.length;

  const data = new Array(gridDimension);
  for (let row = 0; row < gridDimension; ++row) {
    data[row] = new Array(gridDimension);
  }

  for (let y = 0; y < gridDimension; ++y) {
    for (let x = 0; x < gridDimension; ++x) {
      const { floor, wall, doors, characters, doodads, leftFrame, rightFrame } =
        grid[y][x];

      // Sanity check
      if (doors.length === 0) {
        continue;
      }

      if (isEndRoom(y, x, maze)) {
        data[y][x] = {
          y: y,
          x: x,
          wall: "staircase",
          masks: ["staircase"],
          doors: doors,
        };
      } else {
        data[y][x] = {
          y: y,
          x: x,
          floor: floor,
          wall: wall,
          doors: doors,
          characters: characters,
          doodads: doodads,
          leftFrame: leftFrame,
          rightFrame: rightFrame,
        };
      }
    }
  }

  return data;
};
