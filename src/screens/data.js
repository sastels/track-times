import React, { Component } from "react";
import { css } from "emotion";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import firebase, { signIn, loadData } from "../utils/firebase";
import WaitTable from "../components/WaitTable";

const INTERVAL_LENGTH = 30.0 / 60; // in hours
const INTERVAL_SPACING = 30.0 / 60; // in hours

// Initialize Firebase
const db = firebase.firestore();
db.settings({ timestampsInSnapshots: true });

const root = css`
  text-align: center;
  font-family: Arial, Helvetica, sans-serif;
`;

class DataScreen extends Component {
  state = {
    id: 'test',
    data: [],
    smoothed: []
  };

  componentDidMount() {
    signIn(() => loadData(db, this.state.id, this.setState.bind(this)));
  }

  smoothedData = data => {
    let smoothedTimes = Array(24 / INTERVAL_SPACING)
      .fill()
      .map((x, i) => i * INTERVAL_SPACING);

    let smoothedData = smoothedTimes.map(t => {
      return [
        t,
        data.filter(pt => Math.abs(t - pt[0]) < INTERVAL_LENGTH / 2.0)
      ];
    });
    smoothedData = smoothedData.filter(pt => pt[1].length > 1);
    smoothedData = smoothedData.map(pt => [
      pt[0],
      pt[1].reduce((total, pt) => total + pt[1], 0) / pt[1].length
    ]);
    return smoothedData;
  };

  chartConfig = data => {
    data.sort((a, b) => {
      if (a[0] < b[0]) {
        return -1;
      } else if (a[0] > b[0]) {
        return 1;
      } else {
        return 0;
      }
    });

    return {
      tooltip: {
        formatter: function() {
          const timeHours = Math.floor(this.x);
          const timeMinutes = Math.floor(60 * (this.x - timeHours)).toString();
          const waitMinutes = Math.floor(this.y);
          const waitSeconds = Math.floor(
            60 * (this.y - waitMinutes)
          ).toString();
          const timeString = `<b>${timeHours}:${timeMinutes.padStart(
            2,
            "0"
          )} </b>`;
          const waitString = `<b>${waitMinutes}m ${waitSeconds}s</b>`;
          return `${timeString} : ${waitString}`;
        }
      },
      time: {
        useUTC: false
      },
      chart: {
        zoomType: "x"
      },
      legend: {
        enabled: false
      },
      title: {
        text: "Time of Day"
      },
      xAxis: {
        // type: "datetime",
        title: {
          text: "Time of Day"
        },
        labels: {
          formatter: function() {
            const hours = Math.floor(this.value);
            const minutes = Math.floor(60 * (this.value - hours)).toString();
            return `${hours}:${minutes.padStart(2, "0")}`;
          }
        }
      },
      yAxis: {
        allowDecimals: false,
        title: {
          text: "Minutes"
        },
        min: 0
      },
      plotOptions: {
        spline: {
          marker: {
            enabled: true
          }
        }
      },
      series: [
        {
          data: data,
          name: "Wait Time",
          type: "scatter"
        },
        {
          data: this.smoothedData(data),
          name: "Smoothed",
          type: "spline",
          color: "red",
          marker: {
            enabled: false
          }
        }
      ]
    };
  };

  render() {
    const options = this.chartConfig(
      this.state.data.map(timing => [timing.tod, timing.wait / 60.0])
    );

    let tableData = this.state.data;
    tableData.sort((a, b) => {
      if (a.when < b.when) {
        return 1;
      } else if (a.when > b.when) {
        return -1;
      } else {
        return 0;
      }
    });

    return (
      <div className={root}>
        <HighchartsReact highcharts={Highcharts} options={options} />
        <WaitTable data={tableData.slice(0, 5)} />
      </div>
    );
  }
}

export default DataScreen;
