import type { RequestHandler } from "express";
import type { SubmissionRecord } from "@shared/api";
import { saveSubmission, listSubmissions } from "../storage/submissions";

export const handleCreateSubmission: RequestHandler = async (req, res) => {
  const body = req.body as SubmissionRecord;
  if (!body || !body.code || !body.language) {
    return res.status(400).json({ error: "Invalid submission" });
  }
  try {
    await saveSubmission(body);
    res.status(201).json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Failed to save" });
  }
};

export const handleListSubmissions: RequestHandler = async (req, res) => {
  try {
    const limit = Math.min(
      Math.max(parseInt(String(req.query.limit ?? "20"), 10) || 20, 1),
      100,
    );
    const items = await listSubmissions({ limit });
    res.json({ items });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Failed to list" });
  }
};
