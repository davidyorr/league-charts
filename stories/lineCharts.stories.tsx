import { LeagueCharts } from "../src/index";
import { MatchParticipantFrameDto } from "../src/api";
import MockAdapter from "axios-mock-adapter";
import React from "react";
import axios from "axios";
import { matchDto } from "./mock/match";
import { matchIds } from "./mock/match-list";
import { accountDto } from "./mock/account";
import { timelineDto } from "./mock/timeline";
import { useEffect } from "@storybook/client-api";

const mock = new MockAdapter(axios);
mock.reset();
mock
  .onGet(
    "https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/AudreyRuston/NA1"
  )
  .reply(200, accountDto)
  .onGet(
    "https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/fkqfvV7L5LRjJNZzfZOwwh4EdGKwspVeFBh1iMc2cuEx_CPvtQgKDRi7d9AITQYiAXBdpEwSvXSlTg/ids?count=1"
  )
  .reply(200, matchIds)
  .onGet(
    "https://americas.api.riotgames.com/lol/match/v5/matches/NA1_4944360943"
  )
  .reply(200, matchDto)
  .onGet(
    "https://americas.api.riotgames.com/lol/match/v5/matches/NA1_4944360943/timeline"
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
      chartContext: document.getElementById("line-chart"),
      gameName: "AudreyRuston",
      tagLine: "NA1",
      chartOptions: {
        responsive: false,
      },
      afterRender: () => {
        console.log("passed callback");
        document.getElementById("line-chart").classList.add("loaded");
      },
    });
  }, [stat]);

  return <canvas id="line-chart" width="800" height="400"></canvas>;
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
