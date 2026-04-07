import { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import {
  characterAssets,
  doodadAssets,
  doorAssets,
  floorAssets,
  frameAssets,
  maskAssets,
  wallAssets,
} from "./AssetMaps.js";
import {
  characterXYZ,
  doorSizes,
  doorXYZ,
  doodadXYZ,
  frameXYZ,
  gameConfig,
  maskXYZ,
} from "./Constants.js";
import { getImage } from "./AssetCache.js";

// Returns first asset with non-transparent pixel at test coordinate
// Takes a list of images sorted along z-depth
const getNearestAsset = (images, testCanvas, testContext, testX, testY) => {
  for (const { image, asset, x0, y0 } of images) {
    testContext.clearRect(0, 0, testCanvas.width, testCanvas.height);
    testContext.drawImage(image, x0, y0, image.width, image.height);

    try {
      const pixelData = testContext.getImageData(testX, testY, 1, 1);
      const alpha = pixelData.data[3];
      if (alpha !== 0) {
        return asset;
      }
    } catch (e) {
      // Log and fail silently
      console.log(e);
    }
  }
  return null;
};

// Sorts images based on z-depth then renders them to canvas
const drawAssets = (context, canvas, images) => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  images.sort((a, b) => a.position.z - b.position.z);
  images.forEach(({ image, position: { x, y } }) => {
    context.drawImage(image, x, y, image.width, image.height);
  });
};

const initializeAssetPositions = (
  masks,
  walls,
  floors,
  doors,
  characters,
  doodads,
  frames,
) => {
  const positions = {};

  masks.forEach((asset) => {
    positions[asset] = maskXYZ[asset];
  });

  [...walls, ...floors].forEach((asset) => {
    positions[asset] = { x: 0, y: 0, z: 0 };
  });

  doors.forEach((asset) => {
    positions[asset] = doorXYZ[asset];
  });

  characters.forEach((asset) => {
    positions[asset] = characterXYZ[asset];
  });

  doodads.forEach((asset) => {
    positions[asset] = doodadXYZ[asset];
  });

  frames.forEach((asset) => {
    positions[asset] = { x: 0, y: 0, z: 5 };
  });

  return positions;
};

const loadAssets = (assets, assetPaths, positions) => {
  return Promise.all(
    assets.map((asset) =>
      getImage(assetPaths[asset]).then((image) => ({
        image,
        position: positions[asset],
      })),
    ),
  );
};

// Tests which element can be clicked based on bounding box
const getCandidateAssets = (testX, testY, assets) => {
  const assetSizes = new Map();
  const assetXYZ = new Map();

  for (const key of Object.keys(doorSizes)) {
    assetSizes.set(key, doorSizes[key]);
  }

  for (const key of Object.keys(maskAssets)) {
    assetSizes.set(key, {
      w: gameConfig.SCREEN_WIDTH,
      h: gameConfig.SCREEN_HEIGHT,
    });
  }

  for (const key of Object.keys(characterAssets)) {
    assetSizes.set(key, {
      w: gameConfig.SCREEN_WIDTH,
      h: gameConfig.SCREEN_HEIGHT,
    });
  }

  for (const key of Object.keys(frameAssets)) {
    assetSizes.set(key, {
      w: gameConfig.SCREEN_WIDTH,
      h: gameConfig.SCREEN_HEIGHT,
    });
  }

  for (const key of Object.keys(doorXYZ)) {
    assetXYZ.set(key, doorXYZ[key]);
  }

  for (const key of Object.keys(maskAssets)) {
    assetXYZ.set(key, {
      x: 0,
      y: 0,
      z: maskXYZ[key].z,
    });
  }

  for (const key of Object.keys(characterAssets)) {
    assetXYZ.set(key, {
      x: 0,
      y: 0,
      z: characterXYZ[key].z,
    });
  }

  for (const key of Object.keys(frameAssets)) {
    assetXYZ.set(key, {
      x: 0,
      y: 0,
      z: frameXYZ[key].z,
    });
  }

  const candidateAssets = assets.filter((asset) => {
    const { w, h } = assetSizes.get(asset);
    const { x, y } = assetXYZ.get(asset);
    return testX >= x && testX <= x + w && testY >= y && testY <= y + h;
  });


  candidateAssets.sort((a, b) => assetXYZ.get(b).z - assetXYZ.get(a).z);
  return candidateAssets;
};

// Registers hit if pixel opacity not 0
const testAssetOpacity = (
  candidateAssets,
  testCanvas,
  testContext,
  x,
  y,
  successHandler,
  failureHandler,
) => {
  const allAssets = {
    ...doorAssets,
    ...maskAssets,
    ...characterAssets,
    ...frameAssets,
  };
  const allXYZ = {
    ...doorXYZ,
    ...maskXYZ,
    ...characterXYZ,
    ...frameXYZ,
  };

  const loadTasks = candidateAssets.map((asset) => {
    const url = allAssets[asset];
    const { x: x0, y: y0 } = allXYZ[asset];
    return getImage(url).then((image) => ({ image, asset, x0, y0 }));
  });

  return Promise.all(loadTasks)
    .then((images) => {
      const asset = getNearestAsset(images, testCanvas, testContext, x, y);
      if (asset) {
        successHandler(asset);
      } else {
        failureHandler?.();
      }
    })
    .catch((error) => {
      console.log("Asset opacity test failed:", error);
      failureHandler?.();
    });
};

const handleCanvasMouseEvent = async (
  xy,
  testCanvasRef,
  assets,
  successHandler,
  failureHandler = null,
) => {
  const [x, y] = xy;
  const testCanvas = testCanvasRef.current;
  const testContext = testCanvas.getContext("2d");

  const candidateAssets = getCandidateAssets(x, y, assets);
  if (candidateAssets.length === 0) {
    failureHandler?.();
    return null;
  }

  return await testAssetOpacity(
    candidateAssets,
    testCanvas,
    testContext,
    x,
    y,
    successHandler,
    failureHandler,
  );
};

export default function AssetCanvas({
  masks,
  walls,
  floors,
  doors,
  characters,
  doodads,
  frames,
  handleAssetClick,
}) {
  const canvasRef = useRef(null);
  const testCanvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = gameConfig.SCREEN_WIDTH;
    canvas.height = gameConfig.SCREEN_HEIGHT;

    const testCanvas = testCanvasRef.current;
    testCanvas.width = gameConfig.SCREEN_WIDTH;
    testCanvas.height = gameConfig.SCREEN_HEIGHT;

    const context = canvas.getContext("2d");
    const positions = initializeAssetPositions(
      masks,
      walls,
      floors,
      doors,
      characters,
      doodads,
      frames,
    );

    // Load all asset types and render when complete
    Promise.all([
      loadAssets(masks, maskAssets, positions),
      loadAssets(walls, wallAssets, positions),
      loadAssets(floors, floorAssets, positions),
      loadAssets(doors, doorAssets, positions),
      loadAssets(characters, characterAssets, positions),
      loadAssets(doodads, doodadAssets, positions),
      loadAssets(frames, frameAssets, positions),
    ]).then((assetGroups) => {
      const allImages = assetGroups.flat();
      drawAssets(context, canvas, allImages);
    });
  }, [masks, walls, floors, doors, characters, doodads, frames]);

  const getXY = (event) => {
    const r = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - r.left;
    const y = event.clientY - r.top;
    return [x, y];
  };

  const getClickable = () => {
    return [...masks, ...doors, ...characters, ...frames];
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{ border: "1px solid black" }}
        onClick={(e) => {
          handleCanvasMouseEvent(
            getXY(e),
            testCanvasRef,
            getClickable(),
            handleAssetClick,
          );
        }}
        onMouseMove={(e) => {
          handleCanvasMouseEvent(
            getXY(e),
            testCanvasRef,
            getClickable(),
            () => {
              canvasRef.current.style.cursor = "pointer";
            },
            () => {
              canvasRef.current.style.cursor = "none";
            },
          );
        }}
      />
      <canvas ref={testCanvasRef} style={{ display: "none" }} />
    </div>
  );
}

AssetCanvas.propTypes = {
  masks: PropTypes.array.isRequired,
  walls: PropTypes.array.isRequired,
  floors: PropTypes.array.isRequired,
  doors: PropTypes.array.isRequired,
  characters: PropTypes.array.isRequired,
  doodads: PropTypes.array.isRequired,
  frames: PropTypes.string.isRequired,
  handleAssetClick: PropTypes.func.isRequired,
};
