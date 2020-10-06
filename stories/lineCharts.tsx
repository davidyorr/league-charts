import React from "react";

import { useEffect } from "@storybook/client-api";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

import { LeagueCharts } from "../src/index";

import { summonerDto } from "./mock/summoner";
import { matchListDto } from "./mock/match-list";
import { matchDto } from "./mock/match";
import { timelineDto } from "./mock/timeline";

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
    leagueCharts.teamGoldAdvantage({
      chartContext: document.getElementById("team-gold-advantage-chart"),
      summonerName: "AudreyRuston",
      chartOptions: {
        responsive: false,
      },
    });
  }, []);

  return (
    <canvas id="team-gold-advantage-chart" width="800" height="400"></canvas>
  );
};

export default {
  title: "Line Charts",
  decorators: [(story: any) => story()],
};
