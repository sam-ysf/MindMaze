import { useState } from "react";
import PropTypes from "prop-types";

const PlayerNameDialog = ({ onSubmitName, onCancel }) => {
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!playerName.trim()) {
      setError("Please enter a player name");
      return;
    }

    if (playerName.trim().length > 20) {
      setError("Player name must be 20 characters or less");
      return;
    }

    onSubmitName(playerName.trim());
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const DIALOG_OVERLAY_STYLES = {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    bottom: 0,
    display: "flex",
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 3000,
  };

  const DIALOG_STYLES = {
    backgroundColor: "#f5f1e8",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
    padding: "40px",
    textAlign: "center",
    width: "400px",
  };

  const TITLE_STYLES = {
    color: "#34322d",
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "20px",
  };

  const INPUT_STYLES = {
    borderRadius: "4px",
    boxSizing: "border-box",
    color: "#34322d",
    fontSize: "16px",
    padding: "10px",
    width: "100%",
  };

  const ERROR_STYLES = {
    color: "#c41e3a",
    fontSize: "14px",
    marginBottom: "15px",
    minHeight: "20px",
  };

  const BUTTON_CONTAINER_STYLES = {
    display: "flex",
    gap: "4px",
    justifyContent: "center",
    marginTop: "20px",
  };

  const BUTTON_STYLES = {
    backgroundColor: "#ebeae1",
    borderRadius: "4px",
    borderWidth: "1px",
    color: "#34322d",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    minWidth: "100px",
    padding: "10px 20px",
  };

  const BUTTON_CANCEL_STYLES = {
    backgroundColor: "#ece2db",
    ...BUTTON_STYLES,
  };

  return (
    <div style={DIALOG_OVERLAY_STYLES}>
      <div style={DIALOG_STYLES}>
        <div style={TITLE_STYLES}>Enter Your Name</div>
        <input
          type="text"
          style={INPUT_STYLES}
          placeholder="Your player name"
          value={playerName}
          onChange={(e) => {
            setPlayerName(e.target.value);
            if (error) {
              setError("");
            }
          }}
          onKeyUp={handleKeyPress}
          autoFocus
          maxLength="20"
        />
        <div style={ERROR_STYLES}>{error}</div>
        <div style={BUTTON_CONTAINER_STYLES}>
          <button style={BUTTON_STYLES} onClick={handleSubmit}>
            Start Game
          </button>
          <button style={BUTTON_CANCEL_STYLES} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

PlayerNameDialog.propTypes = {
  onSubmitName: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default PlayerNameDialog;
