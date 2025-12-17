const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

// GitOps rollout marker (safe to change anytime)
const RELEASE_MARKER = "gitops-test-3";

app.get("/", (req, res) => {
  res.status(200).send(
    "SUCCESS — Tech Challenge 2 (GitOps) ✅\n" +
    `Release: ${RELEASE_MARKER}\n` +
    `Time: ${new Date().toISOString()}\n`
  );
});
app.get("/health", (req, res) => res.status(200).json({ status: "healthy" }));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});
