import { LeagueCharts } from "../src/index";
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

export const Story = () => {
  useEffect(() => {
    const leagueCharts = new LeagueCharts("api key");
    leagueCharts.scoreboard({
      chartContext: document.getElementById("scoreboard"),
      gameName: "AudreyRuston",
      tagLine: "NA1",
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
