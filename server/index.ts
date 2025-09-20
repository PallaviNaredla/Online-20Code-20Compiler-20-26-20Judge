import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleExecute, handleTestRun } from "./routes/execute";
import { handleCreateSubmission, handleListSubmissions } from "./routes/submissions";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Health
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Demo
  app.get("/api/demo", handleDemo);

  // Judge: execute single run
  app.post("/api/execute", handleExecute);

  // Judge: run against tests
  app.post("/api/test-run", handleTestRun);

  // Submissions
  app.get("/api/submissions", handleListSubmissions);
  app.post("/api/submissions", handleCreateSubmission);

  return app;
}
