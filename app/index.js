const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("Hello, World!"));
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

// CPU burn endpoint to trigger HPA (deterministic)
app.get("/burn", (req, res) => {
  const ms = parseInt(req.query.ms || "250", 10); // default 250ms
  const end = Date.now() + ms;
  while (Date.now() < end) {
    // busy loop
  }
  res.send(`burned ${ms}ms`);
});

app.listen(port, "0.0.0.0", () => console.log(`Listening on ${port}`));
