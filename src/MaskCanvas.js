import { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { gameConfig } from "./Constants.js";

// Sorts images based on z-depth then renders them to canvas
const drawAssets = (context, canvas, images) => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  images.forEach(({ image }) => {
    context.drawImage(image, 0, 0, image.width, image.height);
  });
};

const loadAssets = (assets) => {
  const { getImage } = require("./AssetCache.js");
  return Promise.all(
    assets.map((asset) => getImage(asset).then((image) => ({ image }))),
  );
};

// Returns first asset with non-transparent pixel at test coordinate
// Takes a list of images sorted along z-depth
const assetClickTest = (image, testCanvas, testContext, testX, testY) => {
  testContext.clearRect(0, 0, testCanvas.width, testCanvas.height);
  testContext.drawImage(image, 0, 0, image.width, image.height);

  try {
    const pixelData = testContext.getImageData(testX, testY, 1, 1);
    const alpha = pixelData.data[3];
    if (alpha !== 0) {
      return true;
    }
  } catch (e) {
    // Log and fail silently
    console.log(e);
  }

  return false;
};

// Registers hit if pixel opacity not 0
const testAssetOpacity = (
  asset,
  testCanvas,
  testContext,
  x,
  y,
  clickHandler,
) => {
  const { getImage } = require("./AssetCache.js");
  return getImage(asset)
    .then((image) => {
      clickHandler(assetClickTest(image, testCanvas, testContext, x, y));
    })
    .catch(() => {
      clickHandler(false);
    });
};

const handleCanvasMouseEvent = async (
  xy,
  testCanvasRef,
  asset,
  clickHandler,
) => {
  const [x, y] = xy;
  const testCanvas = testCanvasRef.current;
  const testContext = testCanvas.getContext("2d");

  return await testAssetOpacity(
    asset,
    testCanvas,
    testContext,
    x,
    y,
    clickHandler,
  );
};

export default function MaskCanvas({
  maskAsset,
  sceneAsset,
  shouldHandleMouseOver,
  clickHandler,
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

    // Load all asset types and render when complete
    Promise.all([loadAssets([maskAsset, sceneAsset])]).then((assetGroups) => {
      const allImages = assetGroups.flat();
      drawAssets(context, canvas, allImages);
    });
  }, [maskAsset, sceneAsset]);

  const getXY = (event) => {
    const r = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - r.left;
    const y = event.clientY - r.top;
    return [x, y];
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
            maskAsset,
            clickHandler,
          );
        }}
        onMouseMove={(e) => {
          if (!shouldHandleMouseOver) {
            return;
          }

          handleCanvasMouseEvent(
            getXY(e),
            testCanvasRef,
            maskAsset,
            (status) => {
              if (status) {
                canvasRef.current.style.cursor = "pointer";
              } else {
                canvasRef.current.style.cursor = "none";
              }
            },
          );
        }}
      />
      <canvas ref={testCanvasRef} style={{ display: "none" }} />
    </div>
  );
}

MaskCanvas.propTypes = {
  maskAsset: PropTypes.string.isRequired,
  sceneAsset: PropTypes.string.isRequired,
  shouldHandleMouseOver: PropTypes.bool.isRequired,
  clickHandler: PropTypes.func.isRequired,
};
