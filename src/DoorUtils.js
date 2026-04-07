// Door direction constants and utilities
export const DOOR_DIRECTIONS = {
  LEFT: "L",
  UP: "U",
  RIGHT: "R",
  DOWN: "D",
};

export const DOOR_DIRECTION_ENUM = {
  L: 0,
  U: 1,
  R: 2,
  D: 3,
};

// Reverse mapping for converting enumeration back to direction
export const ENUM_TO_DIRECTION = {
  0: "L",
  1: "U",
  2: "R",
  3: "D",
};

// Normalize and sort doors to a consistent order
export const sortDoors = (doorsString) => {
  const uniqueDoors = [...new Set(doorsString)];
  const enumeratedDoors = uniqueDoors.map((door) => DOOR_DIRECTION_ENUM[door]);

  const sortedEnums = enumeratedDoors.toSorted((a, b) => a - b);
  return sortedEnums.map((enumValue) => ENUM_TO_DIRECTION[enumValue]).join("");
};

// Get the direction map for connecting two adjacent rooms
export const getConnectionMap = () => ({
  left: [DOOR_DIRECTIONS.LEFT, DOOR_DIRECTIONS.RIGHT],
  up: [DOOR_DIRECTIONS.UP, DOOR_DIRECTIONS.DOWN],
  right: [DOOR_DIRECTIONS.RIGHT, DOOR_DIRECTIONS.LEFT],
  down: [DOOR_DIRECTIONS.DOWN, DOOR_DIRECTIONS.UP],
});

// Determine direction between two coordinates
export const determineDirection = (y0, x0, y1, x1) => {
  if (x0 === x1 - 1) {
    return "right";
  }
  if (y0 === y1 - 1) {
    return "down";
  }

  if (x0 === x1 + 1) {
    return "left";
  }

  if (y0 === y1 + 1) {
    return "up";
  }

  return null;
};
