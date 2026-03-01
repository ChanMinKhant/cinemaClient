const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// 1️⃣ Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));

// 2️⃣ Example API (optional)
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// 3️⃣ React Router fallback (IMPORTANT)
// app.get("/*", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "index.html"));
// });

// 4️⃣ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});