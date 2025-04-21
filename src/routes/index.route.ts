import { Router } from "express";
import { drowsinessController } from "@/controllers";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

// Create a new router to handle all routes
const router: Router = Router();

// Static route definitions
router.post("/drowsiness/log", drowsinessController.logDrowsiness);
router.get("/drowsiness/logs", drowsinessController.fetchLogs);

// 404 handler
router.all("*", (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    message: ReasonPhrases.NOT_FOUND,
    status: StatusCodes.NOT_FOUND,
  });
});

export { router };
