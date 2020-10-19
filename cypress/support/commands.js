import "cypress-wait-until";
import { addMatchImageSnapshotCommand } from "cypress-image-snapshot/command";

addMatchImageSnapshotCommand({
  // the font is causing there to be slight differences, so increase this slightly
  failureThreshold: 0.5,
  customSnapshotsDir: "cypress/customdir",
});
