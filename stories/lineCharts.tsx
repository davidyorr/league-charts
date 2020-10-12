import { LeagueCharts } from "../src/index";
import { MatchParticipantFrameDto } from "../src/api";
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

export const Story: {
  args: {
    stat: Exclude<keyof MatchParticipantFrameDto, "participantId" | "position">;
  };
} = ({
  stat,
}: {
  stat: Exclude<keyof MatchParticipantFrameDto, "participantId" | "position">;
}) => {
  useEffect(() => {
    const leagueCharts = new LeagueCharts("api key");
    leagueCharts.lineChart({
      chartStat: stat,
      chartContext: document.getElementById("team-gold-advantage-chart"),
      summonerName: "AudreyRuston",
      chartOptions: {
        responsive: false,
      },
      afterRender: () => {
        console.log("passed callback");
      },
    });
  }, [stat]);

  return (
    <canvas id="team-gold-advantage-chart" width="800" height="400"></canvas>
  );
};

Story.args = {
  stat: "totalGold",
};

const options: {
  [stat in Exclude<
    keyof MatchParticipantFrameDto,
    "participantId" | "position"
  >]: any;
} = {
  currentGold: 0,
  dominionScore: 0,
  jungleMinionsKilled: 0,
  level: 0,
  minionsKilled: 0,
  teamScore: 0,
  totalGold: 0,
  xp: 0,
};

export default {
  title: "Line Charts",
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
