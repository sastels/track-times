import React from "react";
import { css } from "emotion";

const root = css`
  font-family: Arial, Helvetica, sans-serif;
  margin-top: 50px;
`;
const tableStyle = css`
  font-family: arial, sans-serif;
  border-collapse: collapse;
  margin: 0 auto;
`;
const headerStyle = css`
  border: 1px solid #dddddd;
  padding: 8px 20px;
`;
const itemStyle = css`
  border: 1px solid #dddddd;
  text-align: right;
  padding: 8px 20px;
`;

const secondsToTime = x => {
  const waitMinutes = Math.floor(x / 60.0);
  const waitSeconds = Math.floor(x - 60 * waitMinutes).toString();
  return `${waitMinutes}m ${waitSeconds}s`;
};

const WaitTable = props => (
  <div className={root}>
    <table className={tableStyle}>
      <caption
        className={css`
          margin: 20px;
        `}
      >
        Recent data
      </caption>
      <tbody>
        <tr>
          <th className={headerStyle}>When</th>
          <th className={headerStyle}>Wait</th>
        </tr>
        {props.data.map(timing => (
          <tr key={timing.when}>
            <td className={itemStyle}>
              {timing.when.format("YYYY-MM-DD HH:mm:ss")}
            </td>
            <td className={itemStyle}>{secondsToTime(timing.wait)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default WaitTable;
