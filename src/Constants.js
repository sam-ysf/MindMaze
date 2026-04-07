// Game constants and configuration
export const gameConfig = {
  MAZE_DIMENSION: 10,
  SPLICE_INTERVAL: 3,
  SCREEN_WIDTH: 636,
  SCREEN_HEIGHT: 453,
  CONTROLS_TOP_OFFSET: 317,
  DOODAD_TRYINSERT_COUNT: 2,
  POINTS_VICTORY: 20000,
  ANSWER_ATTEMPTS: 2,
  QUESTION_TIME_LIMIT: 66,
  TORCH_DURATION: 8,
};

export const minimapConfig = {
  MARKER_LEFT_OFFSET: 30,
  MARKER_TOP_OFFSET: 325,
  MARKER_X_SCALE: 14,
  MARKER_Y_SCALE: 12,
  CURSOR_LEFT_OFFSET: 34,
  CURSOR_TOP_OFFSET: 328,
};

export const doorXYZ = {
  staircase: { x: 0, y: 0, z: 1 },
  L: { x: 36, y: 99, z: 5 },
  U: { x: 280, y: 92, z: 5 },
  S: { x: 296, y: 92, z: 1000 },
  R: { x: 526, y: 98, z: 5 },
  D: { x: 296, y: 270, z: 1000 },
};

export const doorSizes = {
  staircase: { w: gameConfig.SCREEN_WIDTH, h: gameConfig.SCREEN_HEIGHT },
  L: { w: 80, h: 165 },
  U: { w: 74, h: 120 },
  S: { w: 44, h: 43 },
  R: { w: 79, h: 161 },
  D: { w: 44, h: 43 },
};

export const characterXYZ = {
  alchemist: { x: 211, y: 16, z: 40 },
  beheading: { x: 123, y: 16, z: 30 },
  geisha: { x: 371, y: 94, z: 40 },
  jackInBox: { x: 377, y: 88, z: 20 },
  jester: { x: 431, y: 86, z: 15 },
  jesterHanging: { x: 7, y: 16, z: 40 },
  jesterLaughing: { x: 215, y: 19, z: 50 },
  king: { x: 382, y: 48, z: 15 },
  kingStone: { x: 382, y: 48, z: 20 },
  knightFar: { x: 440, y: 100, z: 10 },
  knightNear: { x: 158, y: 16, z: 50 },
  maid: { x: 26, y: 68, z: 40 },
  maidNear: { x: 368, y: 45, z: 50 },
  parade: { x: 58, y: 96, z: 25 },
  parrot: { x: 155, y: 87, z: 40 },
  princess: { x: 0, y: 16, z: 40 },
  saracen: { x: 148, y: 94, z: 20 },
  scoundrel: { x: 366, y: 94, z: 40 },
  scoundrelFar: { x: 144, y: 103, z: 20 },
  scoundrelNear: { x: 0, y: 27, z: 50 },
  servantBoy: { x: 373, y: 204, z: 30 },
  waterBoy: { x: 378, y: 219, z: 40 },
  witch: { x: 220, y: 97, z: 25 },
};

export const maskXYZ = {
  staircase: { x: 0, y: 0, z: 5 },
};

export const doodadXYZ = {
  flag: { x: 0, y: 0, z: 10 },
  gobletShelf: { x: 0, y: 0, z: 20 },

  urn: { x: 0, y: 0, z: 10 },
  vase: { x: 0, y: 0, z: 10 },
  chest: { x: 0, y: 0, z: 20 },
  fancyTable: { x: 0, y: 0, z: 20 },
  broom: { x: 0, y: 0, z: 30 },

  bookshelf: { x: 0, y: 0, z: 10 },
  pictureFrameLeft: {x:0, y: 0, z: 10},
  furniture: {x:0, y: 0, z: 25},
  table: {x:0, y: 0, z: 30},
  candleStanding: {x:0, y: 0, z: 40},

  dinnerTable: {x:0, y: 0, z: 20},

  plant: {x:0, y: 0, z: 40},
  stool: {x:0, y: 0, z: 40},

  candleHanging: {x:0, y: 0, z: 10},
  banner: {x:0, y: 0, z: 30},
};

export const collisionMap = {
  flag: [10],
  gobletShelf: [20],

  urn: [110],
  vase: [110],
  chest: [120],
  fancyTable: [120],
  broom: [130],

  beheading: [130, 340],

  bookshelf: [210],
  pictureFrameLeft: [210],

  furniture: [225],
  witch: [225, 325],
  table: [230],
  candleStanding: [240],
  knightNear: [250, 450],
  maid: [140, 240],

  dinnerTable: [320, 430],
  jackInBox: [320],
  kingStone: [320],
  parade: [125, 430],
  servantBoy: [330],

  plant: [440],
  stool: [440],

  candleHanging: [510],
  banner: [530],
};

export const frameXYZ = {
  leftArts: { x: 0, y: 0, z: 5 },
  leftGamesSports: { x: 0, y: 0, z: 5 },
  leftGeography: { x: 0, y: 0, z: 5 },
  leftHistory: { x: 0, y: 0, z: 5 },
  leftLifeScience: { x: 0, y: 0, z: 5 },
  leftPerformingArts: { x: 0, y: 0, z: 5 },
  leftPhysicalScience: { x: 0, y: 0, z: 5 },
  leftReligionPhilosophy: { x: 0, y: 0, z: 5 },
  leftSocialScience: { x: 0, y: 0, z: 5 },

  rightArts: { x: 0, y: 0, z: 5 },
  rightGamesSports: { x: 0, y: 0, z: 5 },
  rightGeography: { x: 0, y: 0, z: 5 },
  rightHistory: { x: 0, y: 0, z: 5 },
  rightLifeScience: { x: 0, y: 0, z: 5 },
  rightPerformingArts: { x: 0, y: 0, z: 5 },
  rightPhysicalScience: { x: 0, y: 0, z: 5 },
  rightReligionPhilosophy: { x: 0, y: 0, z: 5 },
  rightSocialScience: { x: 0, y: 0, z: 5 },
};

// Control panel layout configuration
export const controlPanelConfig = {
  areaOfInterest: {
    positions: [
      { left: 171, top: 342 },
      { left: 279, top: 342 },
      { left: 171, top: 361 },
      { left: 279, top: 361 },
      { left: 171, top: 380 },
      { left: 279, top: 380 },
      { left: 171, top: 399 },
      { left: 279, top: 399 },
      { left: 171, top: 418 },
      { left: 279, top: 418 },
    ],
    size: { width: 12, height: 12 },
  },
  levels: {
    positions: [
      { left: 455, top: 344 },
      { left: 455, top: 370 },
      { left: 455, top: 396 },
      { left: 455, top: 422 },
    ],
    size: { width: 29, height: 26 },
  },
  torches: {
    positions: [
      { left: 6, top: 325 },
      { left: 6, top: 349 },
      { left: 6, top: 373 },
      { left: 6, top: 397 },
      { left: 6, top: 421 },
    ],
    size: { width: 20, height: 23 },
  },
  questionAnswers: {
    positions: [
      { left: 176, top: 328 },
      { left: 176, top: 358 },
      { left: 176, top: 388 },
      { left: 176, top: 418 },
    ],
  },
  pointsPosition: {
    left: 492,
    top: 432,
  },
};

export const sceneStyles = {
  container: {
    height: `${gameConfig.SCREEN_HEIGHT}px`,
    position: "relative",
    width: `${gameConfig.SCREEN_WIDTH}px`,
  },
  wall: {
    bottom: "0",
    left: "0",
    position: "absolute",
    top: "0",
    userDrag: "none",
    userSelect: "none",
  },
  floor: {
    bottom: "0",
    left: "0",
    position: "absolute",
    top: "0",
    userDrag: "none",
    userSelect: "none",
  },
  character: {
    cursor: "pointer",
    position: "absolute",
    userDrag: "none",
    userSelect: "none",
  },
  doodad: {
    position: "absolute",
    userDrag: "none",
    userSelect: "none",
  },
  door: {
    cursor: "pointer",
    position: "absolute",
    userDrag: "none",
    userSelect: "none",
  },
  minimapWidget: {
    position: "absolute",
    userDrag: "none",
    userSelect: "none",
  },
  controls: {
    left: "0",
    position: "absolute",
    top: `${gameConfig.CONTROLS_TOP_OFFSET}px`,
  },
};

// Shared UI constants and styles
export const uiConfig = {
  controlTable: {
    padding: 10,
    rowHeight: 50,
  },
};

export const wallTypes = [
  "stoneArchedRoof",
  "whiteArchedRoof",
  "stoneJadeRoof",
  "stoneWoodenRoof",
  "whiteJadeRoof",
  "whiteWoodenRoof",
];

export const wallToFloorTypes = {
  ["stoneArchedRoof"]: [
    "yellowCarpetStoneArch",
    "blueCarpetStoneArch",
    "checkerboardStoneArch",
    "plainStoneArch",
    "roundCarpetStoneArch",
  ],
  ["stoneJadeRoof"]: [
    "yellowCarpetStone",
    "blueCarpetStone",
    "checkerboardStone",
    "plainStone",
    "roundCarpetStone",
  ],
  ["stoneWoodenRoof"]: [
    "yellowCarpetStone",
    "blueCarpetStone",
    "checkerboardStone",
    "plainStone",
    "roundCarpetStone",
  ],
  ["whiteArchedRoof"]: [
    "yellowCarpetWhiteArch",
    "blueCarpetWhiteArch",
    "checkerboardWhiteArch",
    "plainWhiteArch",
    "roundCarpetWhiteArch",
  ],
  ["whiteJadeRoof"]: [
    "yellowCarpetWhite",
    "blueCarpetWhite",
    "checkerboardWhite",
    "plainWhite",
    "roundCarpetWhite",
  ],
  ["whiteWoodenRoof"]: [
    "yellowCarpetWhite",
    "blueCarpetWhite",
    "checkerboardWhite",
    "plainWhite",
    "roundCarpetWhite",
  ],
};

export const CLOSE_BUTTON_STYLES = {
  backgroundColor: "rgba(200, 200, 200, 0.33)",
  border: "none",
  borderRadius: "4px",
  color: "rgba(0, 0, 0, 0.50)",
  cursor: "pointer",
  fontSize: "16px",
  height: "30px",
  userSelect: "none",
  width: "30px",
};
