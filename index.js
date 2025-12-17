const express = require("express");
const os = require("os");

const app = express();
const PORT = process.env.PORT || 3000;

// GitOps rollout marker (safe to change anytime)
const RELEASE_MARKER = "gitops-test-1";

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/", (req, res) => {
  res.status(200).send(
    `SUCCESS — Tech Challenge 2 is running! ✅\n` +
    `Release: ${RELEASE_MARKER}\n` +
    `Host: ${os.hostname()}\n` +
    `Time: ${new Date().toISOString()}\n`
  );
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`App listening on port ${PORT}`);
});
