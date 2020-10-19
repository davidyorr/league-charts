<p align="center">
  <a href="https://github.com/davidyorr/league-charts/actions?query=workflow%3A%22Node.js+Package%22"><img src="https://github.com/davidyorr/league-charts/workflows/Node.js%20Package/badge.svg" alt="Node.js Package Status"></a>
  <a href="https://github.com/davidyorr/league-charts/actions?query=workflow%3A%22Cypress+Image+Snapshots%22"><img src="https://github.com/davidyorr/league-charts/workflows/Cypress%20Image%20Snapshots/badge.svg" alt="Cypress Image Snapshots Status"></a>
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
  summonerName: "AudreyRuston",
  chartOptions: {
    responsive: false,
  },
});
```

```html
<canvas id="champion-damage-chart" width="600" height="500" />
```

![bar chart screenshot](/cypress/snapshots/charts.test.ts/charts%20--%20bar%20chart%20(1).snap.png)

```typescript
const leagueCharts = new LeagueCharts("riot-api-key");
leagueCharts.lineChart({
  chartStat: "totalGold",
  chartContext: document.getElementById("gold-advantage-chart"),
  summonerName: "AudreyRuston",
  chartOptions: {
    responsive: false,
  },
});
```

```html
<canvas id="gold-advantage-chart" width="800" height="400" />
```

![line chart screenshot](cypress/snapshots/charts.test.ts/charts%20--%20line%20chart%20(1).snap.png)

