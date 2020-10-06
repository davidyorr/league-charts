import { loadImage } from "canvas";

import { ChampionMap, RiotApi, ParticipantStatsDto } from "./api";
import { Colors } from "./colors";

import {
  Chart,
  ChartColor,
  ChartConfiguration,
  ChartData,
  ChartOptions,
  ChartPoint,
  PluginServiceRegistrationOptions,
  Scriptable,
} from "chart.js";

type FunctionParams = {
  chartContext: any;
  summonerName: string;
  chartOptions?: ChartOptions;
  chartPlugins?: PluginServiceRegistrationOptions[];
  afterRender?: Function;
};
export class LeagueCharts {
  #api: RiotApi;
  #championsPromise: Promise<void>;
  #champions?: ChampionMap;

  constructor(apiKey: string) {
    this.#api = new RiotApi(apiKey);

    Chart.defaults.global.defaultFontColor = Colors.text;
    Chart.defaults.global.defaultFontStyle = "normal";

    this.#championsPromise = this.#api
      .champions()
      .then((championResponse) => {
        this.#champions = championResponse.data;
      })
      .catch((err) => {
        console.log("error fetching champion.json", err);
      });
  }

  private async getLastMatchResponse(summonerName: string) {
    const summonerResponse = await this.#api.summoner.byName(summonerName);
    const matchListResponse = await this.#api.matchList.byAccountId(
      summonerResponse.data.accountId
    );
    const matchResponse = await this.#api.match.byMatchId(
      matchListResponse.data.matches[0].gameId
    );

    return matchResponse;
  }

  private convertValueToKilos(value: string | number) {
    return Math.abs(Number(value)) / 1000 + "K";
  }

  private convertToStartCase(value: string) {
    return value
      .replace(/[A-Z]/g, (str) => ` ${str}`)
      .replace(/^./g, (str) => str.toUpperCase());
  }

  async barChart({
    chartContext,
    summonerName,
    chartOptions,
    chartPlugins,
    afterRender,
    chartStat,
  }: FunctionParams & {
    chartStat: keyof ParticipantStatsDto;
  }): Promise<Chart> {
    await this.#championsPromise;
    const matchResponse = await this.getLastMatchResponse(summonerName);
    const icons = this.#champions
      ? matchResponse.data.participantIdentities.map((_, index) => {
          const imageName = (this.#champions as ChampionMap)[
            matchResponse.data.participants[index].championId
          ].image.full;
          return this.#api.championImageUrl(imageName);
        })
      : [];
    let max = 0;

    const data: ChartData = {
      datasets: [
        {
          data: matchResponse.data.participants.map((participant) => {
            const value = participant.stats[chartStat];
            if (value > max) {
              max = value;
            }
            return value;
          }),
          backgroundColor: (({ dataIndex = 0 }) =>
            dataIndex < 5 ? Colors.lightBlue : Colors.lightRed) as Scriptable<
            ChartColor
          >,
          borderColor: (({ dataIndex = 0 }) =>
            dataIndex < 5 ? Colors.blue : Colors.red) as Scriptable<ChartColor>,
          borderWidth: 1,
          label: undefined,
        },
      ],
      labels: matchResponse.data.participantIdentities.map(
        (identity) => identity.player.summonerName
      ),
    };

    const options: ChartOptions = {
      legend: {
        display: false,
      },
      scales: {
        xAxes: [
          {
            ticks: {
              beginAtZero: true,
              callback: (value) =>
                max >= 1000 ? this.convertValueToKilos(value) : value,
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              padding: 36,
            },
          },
        ],
      },
      title: {
        display: true,
        text: this.convertToStartCase(chartStat),
      },
    };

    const imagePromises: Array<Promise<any>> = [];

    const plugins: PluginServiceRegistrationOptions[] = [
      {
        afterRender: (chart) => {
          if (icons.length > 0) {
            const IMAGE_SIZE = 24;

            const yAxis = (chart as any).scales["y-axis-0"];
            yAxis.ticks.forEach((_: any, index: number) => {
              const y = yAxis.getPixelForTick(index);

              imagePromises.push(
                loadImage(icons[index]).then((image) => {
                  chart.ctx?.drawImage(
                    image as any,
                    yAxis.right - IMAGE_SIZE - IMAGE_SIZE / 2,
                    y - IMAGE_SIZE / 2,
                    IMAGE_SIZE,
                    IMAGE_SIZE
                  );
                })
              );
            });

            Promise.all(imagePromises).then(() => {
              if (afterRender) {
                afterRender();
              }
            });
          }
        },
      },
    ];

    const configuration: ChartConfiguration = {
      type: "horizontalBar",
      data,
      options: {
        ...options,
        ...(chartOptions ?? {}),
      },
      plugins: [...plugins, ...(chartPlugins ?? [])],
    };

    return new Chart(chartContext, configuration);
  }

  async teamGoldAdvantage({
    chartContext,
    summonerName,
    chartOptions,
    chartPlugins,
    afterRender,
  }: FunctionParams): Promise<Chart> {
    const matchResponse = await this.getLastMatchResponse(summonerName);
    let timelineResponse;
    try {
      timelineResponse = await this.#api.timeline.byMatchId(
        matchResponse.data.gameId
      );
    } catch (error) {
      console.log("error", error);
    }
    const timeline = timelineResponse?.data;

    const goldDataPoints: ChartPoint[] = [];
    let max = 0;

    const summonerParticipantId =
      matchResponse.data.participantIdentities.find(
        (particiantIdentity) =>
          particiantIdentity.player.summonerName.toLowerCase() ===
          summonerName.toLowerCase()
      )?.participantId ?? 1;

    // as in the top part of the chart, the positive numbers, the blue
    function isTopTeam(participantId: number) {
      if (summonerParticipantId <= 5) {
        return participantId <= 5;
      } else {
        return participantId > 5;
      }
    }

    timeline?.frames.forEach((frame) => {
      const gold = Object.values(frame.participantFrames).reduce<number>(
        (total, participantFrame) => {
          if (isTopTeam(participantFrame.participantId)) {
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
          max = -gold;
        }
      }
    });

    max = Math.round(max / 1000) * 1000;

    const data: ChartData = {
      datasets: [
        {
          data: goldDataPoints,
          borderColor: "rgba(40, 40, 40, 0.7)",
        },
      ],
      labels: goldDataPoints.map((val) => val.x ?? ""),
    };
    const options: ChartOptions = {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Team Gold Advantage",
      },
      scales: {
        xAxes: [
          {
            type: "linear",
            gridLines: {
              display: false,
            },
            ticks: {
              // doing the mod here instead of using stepSize because otherwise it
              // would show the last number as well even if it wasn't divisible by 5
              callback: (value) =>
                Number(value) % 5 === 0 ? `${value}:00` : "",
              min: 0,
              max: goldDataPoints.length - 1,
              autoSkip: false,
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              callback: this.convertValueToKilos,
              min: -max,
              max: max,
              autoSkip: false,
              stepSize: 2000,
            },
          },
        ],
      },
    };

    const plugins: PluginServiceRegistrationOptions[] = [
      {
        afterRender: () => {
          if (afterRender) {
            afterRender();
          }
        },
        beforeRender: function (chartInstance) {
          const data = chartInstance.data;
          if (data !== undefined && data.datasets) {
            if (
              (chartInstance as any).scales &&
              (chartInstance as any).scales["y-axis-0"]
            ) {
              const yScale = (chartInstance as any).scales["y-axis-0"];
              const y = yScale.getPixelForValue(0);

              const gradientFill = chartInstance.ctx?.createLinearGradient(
                0,
                0,
                0,
                chartInstance.height ?? 0
              );
              if (gradientFill) {
                gradientFill.addColorStop(0, Colors.lightBlue);
                gradientFill.addColorStop(
                  y / (chartInstance.height ?? 0) - 0.0001,
                  Colors.lightBlue
                );
                gradientFill.addColorStop(
                  y / (chartInstance.height ?? 0) + 0.0001,
                  Colors.lightRed
                );
                gradientFill.addColorStop(1, Colors.lightRed);

                const model = (chartInstance.getDatasetMeta(0).dataset as any)
                  ?._model;
                if (model) {
                  model.backgroundColor = gradientFill;
                }
              }
            }
          }
        },
      },
    ];

    const configuration: Chart.ChartConfiguration = {
      type: "line",
      data,
      options: {
        ...options,
        ...(chartOptions ?? {}),
      },
      plugins: [...plugins, ...(chartPlugins ?? [])],
    };

    return new Chart(chartContext, configuration);
  }
}
