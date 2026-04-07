import PropTypes from "prop-types";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

// Timer configuration constants
const TIMER_CONFIG = {
  size: 65,
  strokeWidth: 3,
  colors: ["#b0b2a3"],
  colorsTime: [0],
};

// Style constants for timer display
const TIMER_DISPLAY_STYLES = {
  label: {
    fontSize: "10px",
    alignContent: "center",
    textAlign: "center",
    color: "#a0a27f",
  },
  time: {
    fontSize: "14px",
    alignContent: "center",
    textAlign: "center",
    color: "#b95b5c",
  },
};

// Timer display component
const TimerDisplay = ({ remainingTime, label }) => (
  <div>
    <div style={TIMER_DISPLAY_STYLES.time}>{remainingTime}</div>
    <div style={TIMER_DISPLAY_STYLES.label}>{label}</div>
  </div>
);

TimerDisplay.propTypes = {
  remainingTime: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
};

const CountdownTimer = ({ duration, onTimeTick, isActive, label }) => {
  return (
    <CountdownCircleTimer
      isPlaying={isActive}
      duration={duration}
      colors={TIMER_CONFIG.colors}
      colorsTime={TIMER_CONFIG.colorsTime}
      onComplete={() => {
        onTimeTick(0);
      }}
      onUpdate={(v) => {
        onTimeTick(v);
      }}
      size={TIMER_CONFIG.size}
      strokeWidth={TIMER_CONFIG.strokeWidth}
    >
      {({ remainingTime }) => {
        return <TimerDisplay remainingTime={remainingTime} label={label} />;
      }}
    </CountdownCircleTimer>
  );
};

CountdownTimer.propTypes = {
  duration: PropTypes.number.isRequired,
  onTimeTick: PropTypes.func.isRequired,
  isActive: PropTypes.bool.isRequired,
  label: PropTypes.string,
};

export default CountdownTimer;
