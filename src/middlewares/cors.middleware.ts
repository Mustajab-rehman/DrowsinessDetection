import cors from "cors";

export const corsMiddleware = cors({
  origin: "*", // Allow all origins
});
