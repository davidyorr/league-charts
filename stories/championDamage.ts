import { storiesOf } from "@storybook/html";
import { useEffect } from "@storybook/client-api";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

import { LeagueCharts } from "../dist/index.js";

import { summonerDto } from "./mock/summoner";
import { matchListDto } from "./mock/match-list";
import { matchDto } from "./mock/match";

const mock = new MockAdapter(axios);

storiesOf("Champion Damage", module).add("default", () => {
  mock.reset();
  mock
    .onGet(
      "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/AudreyRuston"
    )
    .reply(200, summonerDto)
    .onGet(
      "https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/th9QQeUUH1ZBtWckQpcnFcq9DG30jdyl-Qy3hTbdIOzA4c2ssG8k0Wvm?endIndex=1"
    )
    .reply(200, matchListDto)
    .onGet("https://na1.api.riotgames.com/lol/match/v4/matches/3590307953")
    .reply(200, matchDto)
    .onAny()
    .passThrough();

  useEffect(() => {
    const leagueCharts = new LeagueCharts("api key");

    setTimeout(() => {
      leagueCharts.championDamage({
        chartContext: document.getElementById("champion-damage-chart"),
        summonerName: "AudreyRuston",
        chartOptions: {
          responsive: false,
        },
        afterRender: () => {
          console.log("passed callback");
        },
      });
    }, 3000);
  }, []);

  return `<canvas id="champion-damage-chart" width="600" height="500"></canvas>`;
});
