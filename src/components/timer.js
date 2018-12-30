import moment from "moment";
import React from "react";
import { css } from "emotion";

const timerStyle = css`
  font-family: Arial, Helvetica, sans-serif;
  height: 30px;
  font-size: 20px;
  margin-bottom: 20px;
`;

const Timer = props => (
  <div className={timerStyle}>
    {props.time
      ? "Elevator Time: " +
        moment.utc(props.time.asMilliseconds()).format("mm:ss")
      : ""}
  </div>
);

export default Timer;
