import "cypress-wait-until";
import { addMatchImageSnapshotCommand } from "cypress-image-snapshot/command";

addMatchImageSnapshotCommand({
  // the font is causing there to be slight differences, so increase this slightly
  failureThreshold: 0.05,
  failureThresholdType: "percent",
  customDiffConfig: {
    threshold: 0.1,
  },
  capture: "viewport",
});
