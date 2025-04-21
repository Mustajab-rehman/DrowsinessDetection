import { drowsinessService } from "@/services";
import { Request, Response } from "express";

export const drowsinessController = {
  logDrowsiness: async (req: Request, res: Response) => {
    try {
      const { ear, yawn } = req.body;
      const newLog = await drowsinessService.createLog(ear, yawn);
      res.status(201).json({ message: "Log created", data: newLog });
    } catch (err) {
      res.status(500).json({ error: "Failed to log data" });
    }
  },

  fetchLogs: async (_req: Request, res: Response) => {
    try {
      const logs = await drowsinessService.getLogs();
      res.status(200).json({ data: logs });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  },
};
