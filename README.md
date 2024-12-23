<p align="center">
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
  gameName: "AudreyRuston",
  tagLine: "NA1",
  chartOptions: {
    responsive: false,
  },
});
```

```html
<canvas id="champion-damage-chart" width="750" height="500" />
```

![bar chart screenshot](/cypress/snapshots/charts.test.ts/charts%20--%20bar%20chart%20(1).snap.png)

```typescript
const leagueCharts = new LeagueCharts("riot-api-key");
leagueCharts.lineChart({
  chartStat: "totalGold",
  chartContext: document.getElementById("gold-advantage-chart"),
  gameName: "AudreyRuston",
  tagLine: "NA1",
  chartOptions: {
    responsive: false,
  },
});
```

```html
<canvas id="gold-advantage-chart" width="800" height="400" />
```

![line chart screenshot](/cypress/snapshots/charts.test.ts/charts%20--%20line%20chart%20(1).snap.png)

```typescript
  const leagueCharts = new LeagueCharts("riot-api-key");
  leagueCharts.scoreboard({
    chartContext: document.getElementById("scoreboard"),
    gameName: "AudreyRuston",
    tagLine: "NA1",
  });
```

```html
<canvas id="scoreboard" width="800" height="450" />
```
![scoreboard screenshot](/cypress/snapshots/charts.test.ts/charts%20--%20scoreboard%20(1).snap.png)
