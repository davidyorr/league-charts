import { LeagueCharts } from "../src/index";
import MockAdapter from "axios-mock-adapter";
import React from "react";
import axios from "axios";
import { matchDto } from "./mock/match";
import { matchListDto } from "./mock/match-list";
import { summonerDto } from "./mock/summoner";
import { timelineDto } from "./mock/timeline";
import { useEffect } from "@storybook/client-api";

const mock = new MockAdapter(axios);
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
  .onGet(
    "https://na1.api.riotgames.com/lol/match/v4/timelines/by-match/3590307953?endIndex=1"
  )
  .reply(200, timelineDto)
  .onAny()
  .passThrough();

export const Story = () => {
  useEffect(() => {
    const leagueCharts = new LeagueCharts("api key");
    leagueCharts.scoreboard({
      chartContext: document.getElementById("scoreboard"),
      summonerName: "AudreyRuston",
      afterRender: () => {
        console.log("passed callback");
        document.getElementById("scoreboard").classList.add("loaded");
      },
    });
  });

  return <canvas id="scoreboard" width="800" height="450" />;
};

export default {
  title: "Scoreboard",
  decorators: [(story: any) => story()],
};
