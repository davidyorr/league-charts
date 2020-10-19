import { LeagueCharts } from "../src/index";
import MockAdapter from "axios-mock-adapter";
import { ParticipantStatsDto } from "../src/api/index";
import React from "react";
import axios from "axios";
import { matchDto } from "./mock/match";
import { matchListDto } from "./mock/match-list";
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
    "https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/th9QQeUUH1ZBtWckQpcnFcq9DG30jdyl-Qy3hTbdIOzA4c2ssG8k0Wvm?endIndex=1"
  )
  .reply(200, matchListDto)
  .onGet("https://na1.api.riotgames.com/lol/match/v4/matches/3590307953")
  .reply(200, matchDto)
  .onAny()
  .passThrough();

export const Story: {
  args: {
    stat: keyof ParticipantStatsDto;
  };
} = ({ stat }: { stat: keyof ParticipantStatsDto }) => {
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

  return <canvas id="bar-chart" width="600" height="500" />;
};

Story.args = {
  stat: "totalDamageDealtToChampions",
};

const options: {
  [stat in keyof ParticipantStatsDto]: any;
} = {
  totalUnitsHealed: 0,
  largestMultiKill: 0,
  goldEarned: 0,
  physicalDamageTaken: 0,
  totalPlayerScore: 0,
  champLevel: 0,
  damageDealtToObjectives: 0,
  totalDamageTaken: 0,
  neutralMinionsKilled: 0,
  deaths: 0,
  tripleKills: 0,
  magicDamageDealtToChampions: 0,
  wardsKilled: 0,
  pentaKills: 0,
  damageSelfMitigated: 0,
  largestCriticalStrike: 0,
  totalTimeCrowdControlDealt: 0,
  magicDamageDealt: 0,
  wardsPlaced: 0,
  totalDamageDealt: 0,
  timeCCingOthers: 0,
  largestKillingSpree: 0,
  totalDamageDealtToChampions: 0,
  physicalDamageDealtToChampions: 0,
  neutralMinionsKilledTeamJungle: 0,
  totalMinionsKilled: 0,
  visionScore: 0,
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
