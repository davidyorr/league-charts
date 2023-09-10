import { BarChartStat, LeagueCharts } from "../src/index";
import MockAdapter from "axios-mock-adapter";
import React from "react";
import axios from "axios";
import { matchDto } from "./mock/match";
import { matchIds } from "./mock/match-list";
import { summonerDto } from "./mock/summoner";
import { useEffect } from "@storybook/client-api";

const mock = new MockAdapter(axios);
mock.reset();
mock
  .onGet(
    "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/AudreyRuston"
  )
  .reply(200, summonerDto)
  .onGet(
    "https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/fkqfvV7L5LRjJNZzfZOwwh4EdGKwspVeFBh1iMc2cuEx_CPvtQgKDRi7d9AITQYiAXBdpEwSvXSlTg/ids?count=1"
  )
  .reply(200, matchIds)
  .onGet(
    "https://americas.api.riotgames.com/lol/match/v5/matches/NA1_4128286830"
  )
  .reply(200, matchDto)
  .onAny()
  .passThrough();

export const Story: {
  args: {
    stat: BarChartStat;
  };
} = ({ stat }: { stat: BarChartStat }) => {
  useEffect(() => {
    const leagueCharts = new LeagueCharts("api key");
    leagueCharts.barChart({
      chartStat: stat,
      chartContext: document.getElementById("bar-chart"),
      summonerName: "AudreyRuston",
      chartOptions: {
        responsive: false,
      },
      afterRender: () => {
        console.log("passed callback");
        document.getElementById("bar-chart").classList.add("loaded");
      },
    });
  }, [stat]);

  return <canvas id="bar-chart" width="750" height="500" />;
};

Story.args = {
  stat: "totalDamageDealtToChampions",
};

const options: {
  [stat in BarChartStat]: any;
} = {
  totalDamageDealtToChampions: 0,
};

export default {
  title: "Bar Charts",
  decorators: [(story: any) => story()],
  argTypes: {
    stat: {
      control: {
        type: "select",
        options: Object.keys(options),
      },
    },
  },
};
