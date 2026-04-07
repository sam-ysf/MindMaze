import { useState } from "react";
import parse from "html-react-parser";
import PropTypes from "prop-types";
import {
  CLOSE_BUTTON_STYLES,
  controlPanelConfig,
  gameConfig,
} from "./Constants";
import { promptAssets } from "./AssetMaps.js";
import CountdownTimer from "./CountdownTimer.js";
import { MessageDialog } from "./MessageDialog.js";
import SoundPlayer from "./SoundPlayer.js";
import wiki from "./assets/widgets/wiki.svg";
import { goToWiki } from "./WikiUtils.js";

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const DIALOG_LAYOUT = {
  closeButton: { left: "388px", position: "absolute", top: "44px" },
  questionText: {
    left: "195px",
    position: "absolute",
    top: "114px",
    width: "187px",
  },
  timer: { bottom: "30px", position: "absolute", right: "30px" },
};

const QUESTION_DIALOG_WIDTH = 230;
const QUESTION_DIALOG_HEIGHT = 149;
const QUESTION_DIALOG_BUTTON_POSITION = [85, 121];
const QUESTION_DIALOG_BUTTON_DIMENSION = [63, 19];
const WIKI_ICON_SIZE = 24;

const ANSWER_LABELS = ["A.", "B.", "C.", "D."];

const ANSWER_LABEL_STYLES = {
  alignContent: "center",
  color: "#494339",
  fontSize: "18px",
  left: "176px",
  minHeight: "24px",
  position: "absolute",
  textAlign: "center",
  userSelect: "none",
  width: "24px",
};

const ANSWER_BOX_STYLES = {
  left: "calc({{pos.left}}px + 25px)",
  maxWidth: "325px",
  position: "absolute",
  right: "24px",
  userSelect: "none",
};

const ANSWER_BUTTON_STYLES = {
  alignContent: "center",
  backgroundColor: "#ebeae1",
  border: "none",
  color: "#34322d",
  cursor: "pointer",
  fontSize: "12px",
  minHeight: "24px",
  position: "absolute",
  textAlign: "center",
  userSelect: "none",
  width: "calc(100% - 25px)",
};

const WIKI_BUTTON_STYLES = {
  alignContent: "center",
  backgroundColor: "#ebeae1",
  border: "none",
  cursor: "pointer",
  height: "24px",
  padding: "0px",
  position: "absolute",
  right: "0px",
  userSelect: "none",
};

const DIALOG_OVERLAY_STYLES = {
  alignItems: "center",
  backgroundImage: `url(${promptAssets.questionPrompt}`,
  backgroundRepeat: "no-repeat",
  bottom: 0,
  justifyContent: "center",
  left: 0,
  position: "absolute",
  right: 0,
  top: 0,
  zIndex: 1000,
};

const TIMER_STYLES = {
  backgroundColor: "#eaedde",
  borderRadius: "100px",
  bottom: "30px",
  position: "absolute",
  right: "30px",
  userSelect: "none",
};

const INACTIVE_OVERLAY_STYLES = {
  opacity: "0.4",
  pointerEvents: "none",
};

const ACTIVE_OVERLAY_STYLES = {
  opacity: "1.0",
  pointerEvents: "auto",
};

const CLOSE_BUTTON_WRAPPER_STYLES = {
  left: "388px",
  position: "absolute",
  top: "44px",
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Converts answers array to plaintext (HTML tags removed)
const extractPlaintextAnswers = (answers) => {
  return answers.map((answer) => {
    return answer.replace("<i>", "").replace("</i>", "");
  });
};

// Gets the label (A., B., C., D.) for an answer index
const getAnswerLabel = (index) => ANSWER_LABELS[index] || "";

// ============================================================================
// COMPONENT: ANSWER ITEM
// ============================================================================

const AnswerItem = ({
  position,
  index,
  answer,
  plaintextAnswer,
  handleAnswerSubmit,
}) => {
  const getAnswerLabelStyle = (pos) => ({
    top: `${pos.top}px`,
    ...ANSWER_LABEL_STYLES,
  });
  const answerBoxStyle = {
    ...ANSWER_BOX_STYLES,
    left: `calc(${position.left}px + 25px)`,
    top: `${position.top}px`,
  };

  return (
    <div key={`answer-${index}`}>
      <span style={getAnswerLabelStyle(position)}>{getAnswerLabel(index)}</span>
      <span style={answerBoxStyle}>
        <div
          style={ANSWER_BUTTON_STYLES}
          onKeyDown={() => {}}
          onClick={(e) => {
            e.preventDefault();
            handleAnswerSubmit(plaintextAnswer);
          }}
        >
          {answer}
        </div>
        <button
          style={WIKI_BUTTON_STYLES}
          onClick={(e) => {
            goToWiki(plaintextAnswer, e);
          }}
        >
          <img
            alt="Wikipedia"
            src={wiki}
            width={`${WIKI_ICON_SIZE}px`}
            height={`${WIKI_ICON_SIZE}px`}
          />
        </button>
      </span>
    </div>
  );
};

AnswerItem.propTypes = {
  position: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  answer: PropTypes.string.isRequired,
  plaintextAnswer: PropTypes.string.isRequired,
  handleAnswerSubmit: PropTypes.func.isRequired,
};

// ============================================================================
// COMPONENT: DIALOG
// ============================================================================

const NewRoomQuestionDialog = ({
  question,
  answers,
  effectsVolume,
  expectedAnswer,
  questionLevel,
  handleClose,
  onTimeTick,
  timeLimit = gameConfig.QUESTION_TIME_LIMIT,
}) => {
  const [answerAttempts, setAnswerAttempts] = useState(0);
  const [errorDialog, setErrorDialog] = useState(null);
  const [errorSoundToken, setErrorSoundToken] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [successDialog, setSuccessDialog] = useState(null);
  const [successSoundToken, setSuccessSoundToken] = useState(null);

  const correctAnswer = "/sounds/effects/correct.mp3";
  const incorrectAnswer = "/sounds/effects/incorrect.mp3";

  if (!question) {
    return null;
  }

  const plaintextAnswers = extractPlaintextAnswers(answers);

  const drawAnswers = () =>
    controlPanelConfig.questionAnswers.positions.map((pos, index) => (
      <AnswerItem
        key={`answer-${index}`}
        position={pos}
        index={index}
        answer={parse(answers[index])}
        plaintextAnswer={plaintextAnswers[index]}
        handleAnswerSubmit={(answer) => {
          const newAnswerAttempts = answerAttempts + 1;
          setAnswerAttempts(newAnswerAttempts);

          if (answer === expectedAnswer) {
            setSuccessDialog(promptAssets.promptDialog);
            setSuccessSoundToken(Date.now());
          } else if (answer !== expectedAnswer) {
            setErrorDialog(promptAssets.promptDialog);
            setErrorSoundToken(Date.now());
          }
        }}
      />
    ));

  const getErrorDialogText = () => {
    if (answerAttempts === gameConfig.ANSWER_ATTEMPTS) {
      return "Sorry, that answer is incorrect.";
    } else {
      return "Sorry, that answer is incorrect. Please try again.";
    }
  };

  return (
    <div>
      <div
        style={DIALOG_OVERLAY_STYLES}
        onKeyDown={() => {}}
        onClick={(e) => e.preventDefault()}
      >
        <div style={CLOSE_BUTTON_WRAPPER_STYLES}>
          <button
            style={CLOSE_BUTTON_STYLES}
            onClick={() => {
              setErrorDialog(null);
              setErrorSoundToken(null);
              handleClose(false, null);
            }}
          >
            🗙
          </button>
        </div>

        <div style={TIMER_STYLES}>
          <CountdownTimer
            duration={timeLimit}
            isActive={!!question && !successDialog}
            label="Points"
            onTimeTick={(remainingTime) => {
              setRemainingTime(remainingTime);
              onTimeTick(remainingTime);
            }}
          />
        </div>
        <div style={DIALOG_LAYOUT.questionText}>{parse(question)}</div>
        <div
          style={
            errorDialog === null && successDialog === null
              ? ACTIVE_OVERLAY_STYLES
              : INACTIVE_OVERLAY_STYLES
          }
        >
          {drawAnswers()}
        </div>
      </div>
      {successDialog && (
        <div key={`key-${answerAttempts}`}>
          <MessageDialog
            width={QUESTION_DIALOG_WIDTH}
            height={QUESTION_DIALOG_HEIGHT}
            text={`Correct! ${remainingTime * (questionLevel + 1)} points added to your score.`}
            background={successDialog}
            buttonPosition={QUESTION_DIALOG_BUTTON_POSITION}
            buttonDimension={QUESTION_DIALOG_BUTTON_DIMENSION}
            onClose={() => {
              setSuccessDialog(null);
              setSuccessSoundToken(null);
              handleClose(true, questionLevel);
            }}
          />
        </div>
      )}
      {errorDialog && (
        <div key={`key-${answerAttempts}`}>
          <MessageDialog
            width={QUESTION_DIALOG_WIDTH}
            height={QUESTION_DIALOG_HEIGHT}
            background={errorDialog}
            text={getErrorDialogText()}
            buttonPosition={QUESTION_DIALOG_BUTTON_POSITION}
            buttonDimension={QUESTION_DIALOG_BUTTON_DIMENSION}
            onClose={() => {
              setErrorDialog(null);
              setErrorSoundToken(null);
              if (answerAttempts === gameConfig.ANSWER_ATTEMPTS) {
                handleClose(false, null);
              }
            }}
          />
        </div>
      )}
      {successDialog && successSoundToken && (
        <SoundPlayer
          key={`success-${successSoundToken}`}
          oneshot={true}
          volume={effectsVolume}
          soundFiles={correctAnswer}
        />
      )}
      {errorDialog && errorSoundToken && (
        <SoundPlayer
          key={`error-${errorSoundToken}`}
          oneshot={true}
          volume={effectsVolume}
          soundFiles={incorrectAnswer}
        />
      )}
    </div>
  );
};

NewRoomQuestionDialog.propTypes = {
  question: PropTypes.string.isRequired,
  answers: PropTypes.array.isRequired,
  effectsVolume: PropTypes.number.isRequired,
  expectedAnswer: PropTypes.string.isRequired,
  questionLevel: PropTypes.number.isRequired,
  handleClose: PropTypes.func.isRequired,
  timeLimit: PropTypes.number,
  onTimeTick: PropTypes.func,
};

export default NewRoomQuestionDialog;
