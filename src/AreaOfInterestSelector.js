import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { controlPanelConfig } from "./Constants";
import SoundPlayer from "./SoundPlayer";

export const CONTROL_BUTTON_BASE_STYLES = {
  position: "absolute",
  zIndex: 1000,
};

export const AreaOfInterestSelector = ({ areaOfInterest, handleSelection }) => {
  const [selected, setSelected] = useState(areaOfInterest);
  const [clickSoundCount, setClickSoundCount] = useState(0);
  useEffect(() => {}, [selected]);

  return (
    <div>
      {controlPanelConfig.areaOfInterest.positions.map((pos, index) => {
        return (
          <input
            key={`aoi-${index}`}
            type="radio"
            name="areaOfInterest"
            style={{
              height: `${controlPanelConfig.areaOfInterest.size.height}px`,
              left: `${pos.left}px`,
              top: `${pos.top}px`,
              width: `${controlPanelConfig.areaOfInterest.size.width}px`,
              ...CONTROL_BUTTON_BASE_STYLES,
            }}
            checked={selected === index}
            onChange={(e) => {
              setSelected(index);
              handleSelection(index);
              setClickSoundCount((c) => (c % 1024) + 1);
            }}
          />
        );
      })}
      {clickSoundCount > 0 && (
        <SoundPlayer
          key={`aoi-click-${clickSoundCount}`}
          soundFiles="/sounds/effects/click.mp3"
          oneshot={true}
        />
      )}
    </div>
  );
};

AreaOfInterestSelector.propTypes = {
  areaOfInterest: PropTypes.number.isRequired,
  handleSelection: PropTypes.func.isRequired,
};
