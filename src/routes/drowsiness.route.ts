import { drowsinessController } from "@/controllers";
import { Router } from "express-serve-static-core";

export const drowsiness = (router: Router) => {
  router.post("/log", drowsinessController.logDrowsiness);
  router.get("/logs", drowsinessController.fetchLogs);
};
