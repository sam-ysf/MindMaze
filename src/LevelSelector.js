import PropTypes from "prop-types";
import { controlPanelAssets } from "./AssetMaps";
import { controlPanelConfig } from "./Constants";
import { useState } from "react";
import SoundPlayer from "./SoundPlayer";

export const CONTROL_BUTTON_BASE_STYLES = {
  border: "none",
  height: `${controlPanelConfig.levels.size.height}px`,
  width: `${controlPanelConfig.levels.size.width}px`,
  position: "absolute",
  zIndex: 1000,
};

export const LevelSelector = ({ level, handleSelection }) => {
  const [clickSoundCount, setClickSoundCount] = useState(0);
  const getLevelSelectedButton = (index) => {
    switch (index) {
      case 0:
        return controlPanelAssets.levels.level1Selected;
      case 1:
        return controlPanelAssets.levels.level2Selected;
      case 2:
        return controlPanelAssets.levels.level3Selected;
      case 3:
        return controlPanelAssets.levels.level4Selected;
      default:
        return null;
    }
  };

  const getLevelHoverButton = (index) => {
    switch (index) {
      case 0:
        return controlPanelAssets.levels.level1Hover;
      case 1:
        return controlPanelAssets.levels.level2Hover;
      case 2:
        return controlPanelAssets.levels.level3Hover;
      case 3:
        return controlPanelAssets.levels.level4Hover;
      default:
        return null;
    }
  };

  const getBackground = (index) => {
    if (index === level) {
      return `url(${getLevelSelectedButton(index)}) no-repeat`;
    } else {
      return "none";
    }
  };

  const getCursor = (index) => {
    return level === index ? "default" : "pointer";
  };

  return (
    <div>
      {controlPanelConfig.levels.positions.map((pos, index) => {
        const getLevelButtonStyle = (p, i) => ({
          ...CONTROL_BUTTON_BASE_STYLES,
          background: getBackground(i),
          cursor: getCursor(i),
          left: `${p.left}px`,
          top: `${p.top}px`,
        });

        return (
          <button
            key={`aoi-${index}`}
            style={getLevelButtonStyle(pos, index)}
            onClick={(e) => {
              handleSelection(index);
              setClickSoundCount((c) => (c % 1024) + 1);
            }}
            onMouseEnter={(e) => {
              if (level !== index) {
                e.target.style.background = `url(${getLevelHoverButton(index)}) no-repeat`;
              }
            }}
            onMouseLeave={(e) => {
              if (level !== index) {
                e.target.style.background = "none";
              }
            }}
          />
        );
      })}
      {clickSoundCount > 0 && (
        <SoundPlayer
          key={`level-click-${clickSoundCount}`}
          soundFiles="/sounds/effects/click.mp3"
          oneshot={true}
        />
      )}
    </div>
  );
};

LevelSelector.propTypes = {
  level: PropTypes.number.isRequired,
  handleSelection: PropTypes.func.isRequired,
};
