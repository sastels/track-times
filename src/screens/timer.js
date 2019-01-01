import React, { Component } from "react";
import { css, cx } from "emotion";
import moment from "moment";
import Timer from "../components/timer";
import firebase, { signIn, uploadData } from "../utils/firebase";

const db = firebase.firestore();
db.settings({ timestampsInSnapshots: true });

const buttonStyle = css`
  font-family: Arial, Helvetica, sans-serif;
  height: 70px;
  color: white;
  font-size: 20px;
  width: 300px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 50px;
  margin-top: 20px;
  border-radius: 10px;
  border: 0 solid #00aa66;
  background-color: green;
`;
const redBackground = css`
  background-color: red;
`;
const yellowBackground = css`
  background-color: #ffd700;
  color: black;
`;
const linkStyle = css`
  margin-top: 100px;
  font-size: 15px;
  height: 60px;
  width: 200px;
  background-color: blue;
`;
const instructionStyle = css`
  font-family: Arial, Helvetica, sans-serif;
  color: black;
  font-size: 15px;
  margin-bottom: 20px;
`;
const doneStyle = css`
  color: green;
  font-size: 30pt;
  margin-bottom: 50px;
`;

const STEP_STARTUP = "startup";
const STEP_TRANSIT = "transit";
const STEP_DONE_TRIP = "tripDone";
const STEP_FINISHED = "finished";

const buttonText = {
  startup: "Start Timer",
  transit: "Done!",
  tripDone: "Submit time",
  finished: "Thanks!"
};

const instructions = {
  startup: "Press the button when you start waiting.",
  transit: "Press the button when you're done.",
  tripDone: "Continue the timer or submit your time.",
  finished: ""
};

class TimerScreen extends Component {
  state = {
    step: STEP_STARTUP,
    startTime: undefined,
    endTime: undefined,
    runningTime: undefined,
    timer: undefined,
  };

  componentDidMount() {
    signIn();
  }

  handleTimer = () => {
    const duration = moment.duration(
      moment(new Date()).diff(this.state.startTime)
    );
    this.setState({ runningTime: duration });
  };

  nextStep = id => {
    switch (this.state.step) {
      case STEP_STARTUP:
        this.setState({
          step: STEP_TRANSIT,
          startTime: new Date(),
          timer: setInterval(this.handleTimer)
        });
        break;
      case STEP_TRANSIT:
        clearInterval(this.state.timer);
        this.setState({
          step: STEP_DONE_TRIP,
          endTime: new Date(),
          timer: undefined
        });
        break;
      case STEP_DONE_TRIP:
        uploadData(db, id, {
          wait: this.state.runningTime.asSeconds(),
          when: moment(this.state.endTime).format("YYYY-MM-DD HH:mm:ss [EDT]ZZ")
        });
        this.setState({
          step: STEP_FINISHED
        });
        break;
      default:
        console.log(`ERROR: unknown step ${this.state.step}`)
    }
  };

  restartTimer = () => {
    this.setState({
      step: STEP_TRANSIT,
      timer: setInterval(this.handleTimer)
    });
  };

  buttonBar = (step, id) => (
    <React.Fragment>
      {step === STEP_DONE_TRIP ? (
        <button
          className={cx(buttonStyle, yellowBackground)}
          onClick={this.restartTimer}
        >
          Continue timer
        </button>
      ) : null}

      {step !== STEP_FINISHED ? (
        <button
          className={cx(
            buttonStyle,
            step === STEP_TRANSIT ? redBackground : undefined
          )}
          onClick={() => this.nextStep(id)}
        >
          {buttonText[step]}
        </button>
      ) : (
        <div className={doneStyle}>
          {buttonText[STEP_FINISHED]}
        </div>
      )}
    </React.Fragment>
  );

  render() {
    const id = this.props.id;
    return (
      <div>
        <div className={instructionStyle}>{instructions[this.state.step]}</div>
        <Timer time={this.state.runningTime} />

        {this.buttonBar(this.state.step, id)}

        <button className={cx(buttonStyle, linkStyle)} onClick={() => this.props.switchScreen('data')}>
          Data Charts
        </button>
      </div>
    );
  }
}

export default TimerScreen;
