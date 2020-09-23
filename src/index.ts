import { api } from "./api";

import { CanvasRenderService } from "chartjs-node-canvas";
import { writeFile } from "fs";

(async () => {
  const response = await api.summoner.byName("AudreyRuston");
  console.log(response.data);

  const b = await api.matchList.byAccountId(response.data.accountId);
  console.log(b.data);

  const c = await api.match.byMatchId(b.data.matches[0].gameId);
  // console.log(c.data.participants);
  c.data.participantIdentities.forEach((identity) => {
    console.log(identity.player.summonerName);
  });
  c.data.participants.forEach((participant, i) => {
    console.log(
      `${c.data.participantIdentities[i].player.summonerName}: ${participant.stats.totalDamageDealtToChampions}`
    );
  });

  const data: Chart.ChartData = {
    datasets: [
      {
        data: c.data.participants.map(
          (participant) => participant.stats.totalDamageDealtToChampions
        ),
        backgroundColor: [
          "rgba(2,62,138,0.5)",
          "rgba(2,62,138,0.5)",
          "rgba(2,62,138,0.5)",
          "rgba(2,62,138,0.5)",
          "rgba(2,62,138,0.5)",
          "rgba(133,24,42,0.5)",
          "rgba(133,24,42,0.5)",
          "rgba(133,24,42,0.5)",
          "rgba(133,24,42,0.5)",
          "rgba(133,24,42,0.5)",
        ],
        borderColor: [
          "rgba(2,62,138,1)",
          "rgba(2,62,138,1)",
          "rgba(2,62,138,1)",
          "rgba(2,62,138,1)",
          "rgba(2,62,138,1)",
          "rgba(133,24,42,1)",
          "rgba(133,24,42,1)",
          "rgba(133,24,42,1)",
          "rgba(133,24,42,1)",
          "rgba(133,24,42,1)",
        ],
        borderWidth: 1,
        label: "",
      },
    ],
    labels: c.data.participantIdentities.map(
      (identity) => identity.player.summonerName
    ),
  };

  const options: Chart.ChartOptions = {
    legend: {
      display: false,
    },
    scales: {
      xAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
    title: {
      display: true,
      fontSize: 16,
      fontStyle: "normal",
      text: "Damage to champions",
    },
  };

  // const chart = new Chart()
  let canvasRenderService = new CanvasRenderService(500, 500);

  const configuration: Chart.ChartConfiguration = {
    type: "horizontalBar",
    data,
    options,
  };

  let image = await canvasRenderService.renderToBuffer(
    configuration,
    "image/jpeg"
  );
  // const dataUrl = await canvasRenderService.renderToDataURL(configuration);

  writeFile("chart.jpeg", image, (err) => {
    if (err) {
      console.log("error writing file jpeg", err);
    } else {
      console.log("wrote file jpeg");
    }
  });

  image = await canvasRenderService.renderToBuffer(configuration, "image/png");

  writeFile("chart.png", image, (err) => {
    if (err) {
      console.log("error writing file png", err);
    } else {
      console.log("wrote file png");
    }
  });

  // timeline

  function millisToMinutesAndSeconds(millis: number) {
    const minutes = Math.floor(millis / 60000);
    const seconds = parseInt(((millis % 60000) / 1000).toFixed(0));
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  }

  const d = await api.timeline.byMatchId(b.data.matches[0].gameId);
  const timeline = d.data;

  // type GoldDataPoint = {
  //   x: number; // time
  //   y: number; // gold
  // };

  const goldDataPoints: Chart.ChartPoint[] = [];
  let max = 0;

  timeline.frames.forEach((frame) => {
    const gold = Object.values(frame.participantFrames).reduce<number>(
      (total, participantFrame) => {
        // console.log(participantFrame.particpantId);
        if (participantFrame.participantId > 5) {
          return total + participantFrame.totalGold;
        } else {
          return total - participantFrame.totalGold;
        }
      },
      0
    );
    goldDataPoints.push({
      x: Math.floor(frame.timestamp / 1000 / 60),
      y: gold,
    });

    if (gold > 0) {
      if (gold > max) {
        max = gold;
      }
    } else {
      if (-gold > max) {
        max = gold;
      }
    }

    console.log(`${millisToMinutesAndSeconds(frame.timestamp)} - ${gold}`);
  });
  console.log(goldDataPoints);

  max = Math.round(max / 1000) * 1000;

  const conf: Chart.ChartConfiguration = {
    type: "line",
    data: {
      datasets: [
        {
          data: goldDataPoints,
          backgroundColor: "red",
        },
      ],
      labels: goldDataPoints.map((val) => val.x),
    },
    options: {
      title: {
        display: true,
        text: "Team Gold Advantage",
      },
      scales: {
        xAxes: [
          {
            ticks: {
              callback: (value) => {
                console.log(
                  "t",
                  parseInt(value as string) % 5 === 0
                    ? value + ":00"
                    : undefined
                );
                // return value + ":00";
                return parseInt(value as string) % 5 === 0
                  ? `${value}`
                  : undefined;
              },

              maxRotation: 360,
              minRotation: 360,
              // precision: 5,
              // stepSize: 5,
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              callback: (value) =>
                Math.abs(parseInt(value as string)) / 1000 + "K",
              min: -max,
              max: max,
            },
          },
        ],
      },
    },
  };

  canvasRenderService = new CanvasRenderService(800, 400);

  image = await canvasRenderService.renderToBuffer(conf, "image/jpeg");
  // const dataUrl = await canvasRenderService.renderToDataURL(configuration);

  writeFile("gold.jpeg", image, (err) => {
    if (err) {
      console.log("error writing file jpeg", err);
    } else {
      console.log("wrote file jpeg");
    }
  });

  image = await canvasRenderService.renderToBuffer(conf, "image/png");

  writeFile("gold.png", image, (err) => {
    if (err) {
      console.log("error writing file png", err);
    } else {
      console.log("wrote file png");
    }
  });
})();
