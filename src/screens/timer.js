import React, { Component } from "react";
import { css, cx } from "emotion";
import moment from "moment";
import Timer from "../components/timer";
import { signIn, uploadData } from "../utils/firebase";
import firebase from "firebase/app";
import "firebase/firestore"
import localForage from "localforage"

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
  margin: 50px;
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
  tripDone: "Submit Time",
  finished: "Thanks!"
};

const instructions = {
  startup: 'Press the "Start" button when you start waiting for the elevator.',
  transit: 'Press the "Done" button when you exit the elevator on your floor.',
  tripDone: 'Continue the timer or submit your time.',
  finished: ''
};

class TimerScreen extends Component {
  state = {
    step: STEP_STARTUP,
    startTime: undefined,
    runningTime: undefined,
    timer: undefined,
  };

  componentDidMount() {
    signIn();
    localForage.getItem("step").then(value => {
      if (value) {
        this.setState({
          step: value,
        })
        if (value === STEP_TRANSIT) {
          this.setState({timer: setInterval(this.handleTimer)})
        }
        localForage.getItem("startTime").then(value => {
          if (value) {
            this.setState({startTime: new Date(value)})
          }
        })
        localForage.getItem("runningTime").then(value => {
          if (value) {
            this.setState({runningTime: new moment.duration(value, "seconds")})
          }
        })
      }
    })
  }

  handleTimer = () => {
    const duration = moment.duration(
      moment(new Date()).diff(this.state.startTime)
    );
    this.setState({ runningTime: duration });
    localForage.setItem("runningTime", duration.asSeconds())
  };

  nextStep = id => {
    switch (this.state.step) {
      case STEP_STARTUP:
        const newStartTime = new Date()
        localForage.setItem("step", STEP_TRANSIT)
        localForage.setItem("startTime", newStartTime.toUTCString())
        this.setState({
          step: STEP_TRANSIT,
          startTime: newStartTime,
          timer: setInterval(this.handleTimer)
        });
        break;
      case STEP_TRANSIT:
        localForage.setItem("step", STEP_DONE_TRIP)
        clearInterval(this.state.timer);
        this.setState({
          step: STEP_DONE_TRIP,
          timer: undefined
        });
        break;
      case STEP_DONE_TRIP:
        localForage.setItem("step", STEP_FINISHED)
        uploadData(db, id, {
          wait: this.state.runningTime.asSeconds(),
          when: moment(this.state.startTime).format("YYYY-MM-DD HH:mm:ss [EDT]ZZ")
        });
        this.setState({
          step: STEP_FINISHED
        });
        break;
      default:
        console.log(`ERROR: unknown step ${this.state.step}`)
    }
  };

  continueTimer = () => {
    localForage.setItem("step", STEP_TRANSIT)
    this.setState({
      step: STEP_TRANSIT,
      timer: setInterval(this.handleTimer)
    });
  };

  restartTimer = () => {
    if (this.state.timer) {
      clearInterval(this.state.timer);
    }
    localForage.clear()
    this.setState({
      step: STEP_STARTUP,
      startTime: undefined,
      runningTime: undefined,
      timer: undefined,
    });
  }

  buttonBar = (step, id) => (
    <React.Fragment>
      {step === STEP_DONE_TRIP ? (
        <button
          className={cx(buttonStyle, yellowBackground)}
          onClick={this.continueTimer}
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
      {step !== STEP_STARTUP ? (
        <button
          className={cx(buttonStyle, yellowBackground)}
          onClick={this.restartTimer}
        >
          Restart
        </button>
      ) : null}
    </React.Fragment>
  );

  render() {
    const id = this.props.id;
    let host = window.location.protocol + "//" + window.location.hostname
    if (window.location.port && !["90", "443"].includes(window.location.port)) {
      host  = host + ":" + window.location.port
    }
    return (
      <div>
        <div className={instructionStyle}>{instructions[this.state.step]}</div>
        <Timer time={this.state.runningTime} />

        {this.buttonBar(this.state.step, id)}

        <button className={cx(buttonStyle, linkStyle)} onClick={() => this.props.switchScreen('data')}>
          Data Charts
        </button>

        <div className={instructionStyle}>
          To make your data set, in a browser add your own pathname to the URL
        <br/>
          (for example, {host + "/myData"})
        </div>
      </div>
    );
  }
}

export default TimerScreen;
