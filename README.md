<p align="center">
  <a href="https://github.com/davidyorr/league-charts/actions?query=workflow%3A%22Node.js+Package%22"><img src="https://github.com/davidyorr/league-charts/workflows/Node.js%20Package/badge.svg" alt="Node.js Package Status"></a>
  <a href="https://league-charts.vercel.app/storybook/"><img src="https://raw.githubusercontent.com/storybookjs/brand/master/badge/badge-storybook.svg"></a>
</p>

# League Charts

Generate League of Legends charts

## Demo

Storybook: https://league-charts.vercel.app/storybook/

## Example

```typescript
const leagueCharts = new LeagueCharts("riot-api-key");
leagueCharts.barChart({
  chartStat: "totalDamageDealtToChampions",
  chartContext: document.getElementById("champion-damage-chart"),
  summonerName: "the summoner name",
  chartOptions: {
    responsive: false,
  },
});
```

```html
<canvas id="champion-damage-chart" width="600" height="500" />
```
