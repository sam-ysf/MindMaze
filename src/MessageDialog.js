import { useState } from "react";
import PropTypes from "prop-types";

// Style constants
const DIALOG_CONTAINER_STYLES = {
  position: "absolute",
  zIndex: 2000,
  userSelect: "none",
};

const DIALOG_INNER_WRAPPER = {
  height: "100%",
  position: "relative",
  width: "100%",
};

const DIALOG_CLOSE_BUTTON = {
  borderWidth: "1px",
  color: "#ffffff",
  cursor: "pointer",
  fontSize: "11px",
  position: "absolute",
};

export const MessageDialog = ({
  width,
  height,
  text,
  background,
  buttonPosition,
  buttonDimension,
  onClose = null,
}) => {
  const [hover, setHover] = useState(false);
  const [isActive, setIsActive] = useState(true);

  if (!isActive) {
    return null;
  }

  const [buttonX, buttonY] = buttonPosition;
  const [buttonWidth, buttonHeight] = buttonDimension;

  const containerStyle = {
    ...DIALOG_CONTAINER_STYLES,
    background: `url(${background}) no-repeat`,
    height: `${height}px`,
    left: `calc(50% - ${width / 2}px)`,
    top: `calc(50% - ${height / 2}px)`,
    width: `${width}px`,
  };

  const textStyle = {
    color: "white",
    fontSize: "14px",
    fontWeight: "bold",
    position: "absolute",
    top: "38px",
    padding: "0 14px",
    textAlign: "center",
  };

  const buttonStyle = {
    ...DIALOG_CLOSE_BUTTON,
    background: hover ? "rgba(0, 0, 0, 0.05)" : "rgba(0, 0, 0, 0)",
    height: `${buttonHeight}px`,
    left: `${buttonX}px`,
    top: `${buttonY}px`,
    width: `${buttonWidth}px`,
  };

  return (
    <div style={containerStyle}>
      <div style={DIALOG_INNER_WRAPPER}>
        {text && <div style={textStyle}>{text}</div>}
        <button
          style={buttonStyle}
          aria-label="Close dialog"
          onMouseEnter={() => {
            setHover(true);
          }}
          onMouseLeave={() => {
            setHover(false);
          }}
          onClick={() => {
            setIsActive(false);
            if (onClose) {
              onClose();
            }
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
};

MessageDialog.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  text: PropTypes.string,
  background: PropTypes.string.isRequired,
  buttonPosition: PropTypes.number.isRequired,
  buttonDimension: PropTypes.number.isRequired,
  onClose: PropTypes.func,
};
