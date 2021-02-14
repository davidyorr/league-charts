import {
  Api,
  ChampionMap,
  ItemJson,
  MatchDto,
  MatchParticipantFrameDto,
  ParticipantStatsDto,
  RuneMap,
  SummonerSpellJson,
} from "./api";

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

import { Image, loadImage, registerFont } from "canvas";
import { AxiosResponse } from "axios";
import { Colors } from "./colors";
import commaNumber from "comma-number";

type SpriteSheet = {
  [id: string]: Image;
};

type FunctionParams = {
  chartContext: any;
  summonerName: string;
  region?:
    | "BR1"
    | "EUN1"
    | "EUW1"
    | "JP1"
    | "KR"
    | "LA1"
    | "LA2"
    | "NA1"
    | "OC1"
    | "RU"
    | "TR1";
  chartOptions?: ChartOptions;
  chartPlugins?: PluginServiceRegistrationOptions[];
  afterRender?: () => void;
};
export class LeagueCharts {
  #api: Api;
  // the last data dragon version used, not the most recent version available
  #lastDataDragonVersion: string | undefined;
  // cache of the champions fetched from data dragon
  #champions: ChampionMap | undefined;
  // cache of the items fetched from data dragon
  #items: ItemJson | undefined;
  // cache of the summoner spells fetched from data dragon
  #summonerSpells: SummonerSpellJson | undefined;
  // cache of the runes fetched from data dragon
  #runes: RuneMap | undefined;

  constructor(apiKey: string) {
    this.#api = new Api(apiKey);

    Chart.defaults.global.defaultFontColor = Colors.primaryText;
    Chart.defaults.global.defaultFontStyle = "normal";
    Chart.defaults.global.defaultFontFamily = "Rubik";

    // load the fonts if we're in a node environment
    if (registerFont !== undefined) {
      registerFont(`${__dirname}/assets/RubikLightRegular.ttf`, {
        family: "Rubik",
      });
      registerFont(`${__dirname}/assets/KarlaBold.ttf`, {
        family: "Karla",
      });
    }
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

  private addGradientBackground(chartContext: any): void {
    const ctx = chartContext.getContext("2d");
    const width = chartContext.width;
    const height = chartContext.height;
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, Colors.gradient1);
    gradient.addColorStop(0.5, Colors.gradient2);
    gradient.addColorStop(1, Colors.gradient1);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  // load fonts if the current environment is a browser
  private async loadFonts(): Promise<void> {
    async function loadFont(fontFace: FontFace): Promise<void> {
      try {
        fontFace = await fontFace.load();
        document.fonts.add(fontFace);
      } catch (err) {
        console.log("error loading font", err);
      }
    }

    if (registerFont === undefined && FontFace !== undefined) {
      await loadFont(
        new FontFace(
          "Rubik",
          `url(${require("./assets/RubikLightRegular.ttf")})`
        )
      );
      await loadFont(
        new FontFace("Karla", `url(${require("./assets/KarlaBold.ttf")})`)
      );
    }
  }

  private async imageSpriteSheet(
    matchResponse: AxiosResponse<MatchDto>,
    populateSpriteSheet: (
      imageSpriteSheet: SpriteSheet,
      participant: MatchDto["participants"][0]
    ) => Promise<void>
  ): Promise<SpriteSheet> {
    const imageSpriteSheet: SpriteSheet = {};

    for (const participant of matchResponse.data.participants) {
      await populateSpriteSheet(imageSpriteSheet, participant);
    }

    return imageSpriteSheet;
  }

  private async championImageSpriteSheets(
    matchResponse: AxiosResponse<MatchDto>,
    dataDragonVersion: string
  ): Promise<SpriteSheet> {
    return await this.imageSpriteSheet(
      matchResponse,
      async (championImageSpriteSheets, participant) => {
        if (this.#champions) {
          const spriteId = this.#champions[participant.championId].image.sprite;
          const url = this.#api.championImageSpriteSheetUrl(
            dataDragonVersion,
            spriteId
          );

          if (!championImageSpriteSheets[spriteId]) {
            try {
              championImageSpriteSheets[spriteId] = await loadImage(url);
            } catch (err) {
              console.log(
                `error loading image for champion sprite sheet [spriteId:${spriteId}] [url:${url}]`
              );
            }
          }
        }
      }
    );
  }

  async scoreboard({
    chartContext,
    summonerName,
    region,
    afterRender,
  }: Pick<
    FunctionParams,
    "chartContext" | "summonerName" | "region" | "afterRender"
  >): Promise<Chart> {
    if (region) {
      this.#api.setRegion(region);
    }

    const matchResponse = await this.getLastMatchResponse(summonerName);

    // get the data dragon version
    const dataDragonVersion = await this.#api.dataDragonVersion(
      matchResponse.data.gameVersion
    );

    if (this.#lastDataDragonVersion !== dataDragonVersion) {
      try {
        this.#champions = (await this.#api.champions(dataDragonVersion)).data;
        this.#items = (await this.#api.items(dataDragonVersion)).data;
        this.#summonerSpells = (
          await this.#api.summonerSpells(dataDragonVersion)
        ).data;
        this.#runes = (await this.#api.runes(dataDragonVersion)).data;
      } catch (err) {
        console.log("error fetching data dragon json files", err);
        throw err;
      }
    }

    this.#lastDataDragonVersion = dataDragonVersion;

    // load sprite sheets for the champion images
    const championImageSpriteSheets = await this.championImageSpriteSheets(
      matchResponse,
      dataDragonVersion
    );

    // load sprite sheets for the item images
    const itemImageSpriteSheets = await this.imageSpriteSheet(
      matchResponse,
      async (itemImageSpriteSheets, participant) => {
        if (this.#items) {
          for (let j = 0; j <= 6; j++) {
            const itemId = participant.stats[`item${j}` as "item0"];

            if (itemId) {
              const spriteId = this.#items.data[itemId].image.sprite;
              const url = this.#api.itemSpriteSheetUrl(
                dataDragonVersion,
                spriteId
              );

              if (!itemImageSpriteSheets[spriteId]) {
                try {
                  itemImageSpriteSheets[spriteId] = await loadImage(url);
                } catch (err) {
                  console.log(
                    `error loading image for item sprite sheet [spriteId:${spriteId}] [url:${url}]`
                  );
                }
              }
            }
          }
        }
      }
    );

    // load sprite sheets for the summoner spell images
    const summonerSpellSpriteSheets = await this.imageSpriteSheet(
      matchResponse,
      async (summonerSpellSpriteSheets, participant) => {
        if (this.#summonerSpells) {
          for (let j = 1; j <= 2; j++) {
            const spellId = participant[`spell${j}Id` as "spell1Id"];

            if (spellId) {
              const spriteId = this.#summonerSpells.data[spellId].image.sprite;
              const url = this.#api.summonerSpellSpriteSheetUrl(
                dataDragonVersion,
                spriteId
              );

              if (!summonerSpellSpriteSheets[spriteId]) {
                try {
                  summonerSpellSpriteSheets[spriteId] = await loadImage(url);
                } catch (err) {
                  console.log(
                    `error loading image for summoner spell sprite sheet [spriteId:${spriteId}] [url:${url}]`
                  );
                }
              }
            }
          }
        }
      }
    );

    // load the rune images
    const runeImages = await this.imageSpriteSheet(
      matchResponse,
      async (runeImages, participant) => {
        if (this.#runes) {
          const runeId = participant.stats.perk0;
          const runePath = this.#runes[runeId].icon;
          const url = this.#api.runeImageUrl(runePath);

          if (!runeImages[runeId]) {
            try {
              runeImages[runeId] = await loadImage(url);
            } catch (err) {
              console.log(
                `error loading image for rune [runeId:${runeId}] [url:${url}]`
              );
            }
          }
        }
      }
    );

    const ctx = chartContext.getContext("2d");

    // load the fonts
    await this.loadFonts();

    // draw a gradient background
    this.addGradientBackground(chartContext);

    const yStart = 65;
    const xRune = 20;
    const xSummonerSpell = 45;
    const xChampionLevel = 68;
    const xChampionIcon = 90;
    const xSummonerName = 129;
    const xItem = 275;
    const xKda = 475;
    const xCsScore = 640;
    const xGold = 725;

    const rowHeight = 34;
    const runeSize = 22;
    const championIconSize = rowHeight - 4;
    const itemSize = rowHeight - 10;
    const summonerSpellSize = 14;
    const middleGap = 45;

    matchResponse.data.participantIdentities.forEach(
      (participantIdentity, i) => {
        const y = yStart + rowHeight * i + (i > 4 ? middleGap : 0);

        // draw the primary keystone (rune)
        const runeId = matchResponse.data.participants[i].stats.perk0;
        const image = runeImages[runeId];
        if (image) {
          ctx.drawImage(image, xRune, y - rowHeight / 2, runeSize, runeSize);
        }

        // draw the summoner spells
        for (let j = 1; j <= 2; j++) {
          const summonerSpellId =
            matchResponse.data.participants[i][`spell${j}Id` as "spell1Id"];

          // draw the yellow border around the summoner spell
          ctx.strokeColor = Colors.iconBorder;
          ctx.lineWidth = 0.25;
          ctx.strokeRect(
            xSummonerSpell,
            y - rowHeight + 1 + summonerSpellSize * j,
            summonerSpellSize,
            summonerSpellSize
          );

          // draw the summoner spell
          if (this.#summonerSpells) {
            const summonerSpell = this.#summonerSpells.data[summonerSpellId];
            const image = summonerSpellSpriteSheets[summonerSpell.image.sprite];
            if (image) {
              ctx.drawImage(
                image,
                summonerSpell.image.x,
                summonerSpell.image.y,
                summonerSpell.image.w,
                summonerSpell.image.h,
                xSummonerSpell,
                y - rowHeight + 1 + summonerSpellSize * j,
                summonerSpellSize,
                summonerSpellSize
              );
            }
          }
        }

        // draw the champion level
        ctx.font = "14px Karla, sans-serif";
        ctx.fillStyle = Colors.primaryText;
        ctx.fillText(
          matchResponse.data.participants[i].stats.champLevel,
          xChampionLevel,
          y
        );

        // draw the champion images
        if (this.#champions) {
          const imageDto = this.#champions[
            matchResponse.data.participants[i].championId
          ].image;
          const image = championImageSpriteSheets[imageDto.sprite];
          if (image) {
            ctx?.drawImage(
              image as any,
              imageDto.x,
              imageDto.y,
              imageDto.w,
              imageDto.h,
              xChampionIcon,
              y - rowHeight / 2 - 3,
              championIconSize,
              championIconSize
            );
          }
        }

        // draw the summoner name
        ctx.font = "12px Rubik, sans-serif";
        ctx.fillStyle = Colors.secondaryText;
        ctx.fillText(participantIdentity.player.summonerName, xSummonerName, y);

        // draw the items
        for (let j = 0; j <= 6; j++) {
          const itemId =
            matchResponse.data.participants[i].stats[`item${j}` as "item0"];

          // draw the yellow border around the item
          ctx.strokeStyle = Colors.iconBorder;
          ctx.lineWidth = 0.25;
          ctx.strokeRect(
            xItem + j * itemSize,
            y - itemSize / 2 - 3,
            itemSize,
            itemSize
          );

          // draw the item
          if (itemId && this.#items) {
            const item = this.#items.data[itemId];
            const image = itemImageSpriteSheets[item.image.sprite];
            if (image) {
              ctx.drawImage(
                image,
                item.image.x,
                item.image.y,
                item.image.w,
                item.image.h,
                xItem + j * itemSize,
                y - itemSize / 2 - 3,
                itemSize,
                itemSize
              );
            }
          }
        }
      }
    );

    let team1Kills = 0;
    let team1Deaths = 0;
    let team1Assists = 0;
    let team2Kills = 0;
    let team2Deaths = 0;
    let team2Assists = 0;
    let team1Gold = 0;
    let team2Gold = 0;

    ctx.font = "12px Rubik, sans-serif";
    ctx.fillStyle = Colors.primaryText;

    matchResponse.data.participants.forEach((participant, i) => {
      const y = yStart + rowHeight * i + (i > 4 ? 40 : 0);

      ctx.fillText(participant.stats.kills, xKda, y);
      ctx.fillText("/", xKda + 25, y);
      ctx.fillText(participant.stats.deaths, xKda + 45, y);
      ctx.fillText("/", xKda + 69, y);
      ctx.fillText(participant.stats.assists, xKda + 89, y);
      ctx.fillText(
        participant.stats.totalMinionsKilled +
          participant.stats.neutralMinionsKilled,
        xCsScore,
        y
      );
      ctx.fillText(commaNumber(participant.stats.goldEarned), xGold, y);

      if (i < 5) {
        team1Kills += participant.stats.kills;
        team1Deaths += participant.stats.deaths;
        team1Assists += participant.stats.assists;
        team1Gold += participant.stats.goldEarned;
      } else {
        team2Kills += participant.stats.kills;
        team2Deaths += participant.stats.deaths;
        team2Assists += participant.stats.assists;
        team2Gold += participant.stats.goldEarned;
      }
    });

    const yTeam1 = 30;
    const yTeam2 = 242;
    const xTeamNumber = 20;
    const xTeamKills = 135;
    const xSlash1 = 165;
    const xTeamDeaths = 185;
    const xSlash2 = 215;
    const xTeamAssists = 235;
    const xTeamGold = 335;

    ctx.fillStyle = Colors.blue;
    ctx.font = "15px Karla, sans-serif";
    ctx.fillText("TEAM 1", xTeamNumber, yTeam1);
    ctx.fillText(team1Kills, xTeamKills, yTeam1);
    ctx.fillText("/", xSlash1, yTeam1);
    ctx.fillText(team1Deaths, xTeamDeaths, yTeam1);
    ctx.fillText("/", xSlash2, yTeam1);
    ctx.fillText(team1Assists, xTeamAssists, yTeam1);
    ctx.fillStyle = Colors.secondaryText;
    ctx.fillText(commaNumber(team1Gold), xTeamGold, yTeam1);

    ctx.fillStyle = Colors.red;
    ctx.fillText("TEAM 2", xTeamNumber, yTeam2);
    ctx.fillText(team2Kills, xTeamKills, yTeam2);
    ctx.fillText("/", xSlash1, yTeam2);
    ctx.fillText(team2Deaths, xTeamDeaths, yTeam2);
    ctx.fillText("/", xSlash2, yTeam2);
    ctx.fillText(team2Assists, xTeamAssists, yTeam2);
    ctx.fillStyle = Colors.secondaryText;
    ctx.fillText(commaNumber(team2Gold), xTeamGold, yTeam2);

    if (afterRender) {
      afterRender();
    }

    return chartContext;
  }

  async barChart({
    chartContext,
    summonerName,
    region,
    chartOptions,
    chartPlugins,
    afterRender,
    chartStat,
  }: FunctionParams & {
    chartStat: keyof ParticipantStatsDto;
  }): Promise<Chart> {
    if (region) {
      this.#api.setRegion(region);
    }

    const matchResponse = await this.getLastMatchResponse(summonerName);
    const dataDragonVersion = await this.#api.dataDragonVersion(
      matchResponse.data.gameVersion
    );

    if (this.#lastDataDragonVersion !== dataDragonVersion) {
      try {
        this.#champions = (await this.#api.champions(dataDragonVersion)).data;
      } catch (err) {
        console.log("error fetching champion.json", err);
        throw err;
      }
    }

    this.#lastDataDragonVersion = dataDragonVersion;

    let max = 0;

    const data: ChartData = {
      datasets: [
        {
          data: matchResponse.data.participants.map((participant) => {
            // maybe only allow chartStat to be a type that makes value a number
            // or make an explicit list of certain properties instead of any stat
            const value = participant.stats[chartStat];
            if (value !== undefined && value > max) {
              max = value;
            }
            return value ?? 0;
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
      events: [],
      layout: {
        padding: {
          top: 12,
          right: 36,
          bottom: 12,
          left: 24,
        },
      },
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

    const plugins: PluginServiceRegistrationOptions[] = [
      {
        afterRender: async (chart) => {
          const championImageSpriteSheets = await this.championImageSpriteSheets(
            matchResponse,
            dataDragonVersion
          );

          const IMAGE_SIZE = 24;

          const yAxis = (chart as any).scales["y-axis-0"];
          yAxis.ticks.forEach((_: any, index: number) => {
            const y = yAxis.getPixelForTick(index);

            if (this.#champions) {
              const imageDto = this.#champions[
                matchResponse.data.participants[index].championId
              ].image;
              const image = championImageSpriteSheets[imageDto.sprite];
              if (image) {
                chart.ctx?.drawImage(
                  image as any,
                  imageDto.x,
                  imageDto.y,
                  imageDto.w,
                  imageDto.h,
                  yAxis.right - IMAGE_SIZE - IMAGE_SIZE / 2,
                  y - IMAGE_SIZE / 2,
                  IMAGE_SIZE,
                  IMAGE_SIZE
                );
              }
            }
          });

          if (afterRender) {
            afterRender();
          }
        },
        beforeDraw: async () => {
          this.addGradientBackground(chartContext);
          await this.loadFonts();
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

  async lineChart({
    chartContext,
    summonerName,
    region,
    chartOptions,
    chartPlugins,
    afterRender,
    chartStat,
  }: FunctionParams & {
    chartStat: Exclude<
      keyof MatchParticipantFrameDto,
      "participantId" | "position"
    >;
  }): Promise<Chart> {
    if (region) {
      this.#api.setRegion(region);
    }

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
          particiantIdentity.player.summonerName
            .toLowerCase()
            .replace(/ /g, "") === summonerName.toLowerCase().replace(/ /g, "")
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
            return total + participantFrame[chartStat];
          } else {
            return total - participantFrame[chartStat];
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

    if (max >= 1000) {
      max = Math.ceil(max / 1000) * 1000;
    }

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
      layout: {
        padding: {
          top: 6,
          right: 12,
          bottom: 6,
          left: 12,
        },
      },
      title: {
        display: true,
        text: `Team ${this.convertToStartCase(
          chartStat === "totalGold" ? "gold" : chartStat
        )} Advantage`,
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
              callback: (value) =>
                max >= 1000 ? this.convertValueToKilos(value) : value,
              min: -max,
              max: max,
              autoSkip: false,
              stepSize: max >= 1000 ? 2000 : undefined,
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
        beforeDraw: async () => {
          this.addGradientBackground(chartContext);
          await this.loadFonts();
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
