import {
  determineDirection,
  getConnectionMap,
  sortDoors,
} from "./DoorUtils.js";

export const getRandomArrayEntry = (values) => {
  return values[Math.floor(Math.random() * values.length)];
};

const calcAdjacentCoords = (yCurr, xCurr, gridDimension) => {
  const xCoordinates = [
    Math.max(0, xCurr - 1),
    Math.min(xCurr + 1, gridDimension - 1),
  ];
  const yCoordinates = [
    Math.max(0, yCurr - 1),
    Math.min(yCurr + 1, gridDimension - 1),
  ];

  const xLeft = xCoordinates[0];
  const xRight = xCoordinates[1];

  const yUp = yCoordinates[0];
  const yDown = yCoordinates[1];

  return [
    [yCurr, xLeft],
    [yCurr, xRight],
    [yUp, xCurr],
    [yDown, xCurr],
  ];
};

export const calcNextLegalCoords = (yCurr, xCurr, gridDimension) => {
  if (gridDimension < 0) {
    return null;
  }

  const coords = getRandomArrayEntry(
    calcAdjacentCoords(yCurr, xCurr, gridDimension),
  );

  const [y, x] = coords;
  return yCurr === y && xCurr === x ? null : coords;
};

export const calcNextLegalUnvisitedCoords = (
  yCurr,
  xCurr,
  roomsGrid,
  gridDimension,
) => {
  if (gridDimension < 0) {
    return null;
  }

  const candidateCoordinates = calcAdjacentCoords(yCurr, xCurr, gridDimension);

  const unvisited = [];
  for (const coordinates of candidateCoordinates) {
    const [yi, xi] = coordinates;

    if (!(xi === xCurr && yi === yCurr)) {
      const room = roomsGrid[yi][xi];
      if (room.doors.length === 0) {
        unvisited.push([yi, xi]);
      }
    }
  }

  if (unvisited.length === 0) {
    return null;
  }

  const coords = getRandomArrayEntry(unvisited);

  const [y, x] = coords;
  return yCurr === y && xCurr === x ? null : coords;
};

export const connectRooms = (y0, x0, y1, x1, roomsGrid) => {
  const directionKey = determineDirection(y0, x0, y1, x1);
  if (!directionKey) {
    return;
  }

  const connectionMap = getConnectionMap();
  const [door0, door1] = connectionMap[directionKey];
  roomsGrid[y0][x0].doors += door0;
  roomsGrid[y1][x1].doors += door1;
};

export const sortRoomDoors = (roomsGrid) => {
  for (const row of roomsGrid) {
    for (const room of row) {
      room.doors = sortDoors(room.doors);
    }
  }
};
