import dotenv from "dotenv";
import express, { Express } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { mongoose } from "./datasources";
import { authMiddleware, corsMiddleware } from "./middlewares";
import { router } from "./routes/index.route";
import { createHash } from "crypto";
import fs from "fs";

// Configure dotenv to use .env file like .env.dev or .env.prod
dotenv.config({
  path: `.env.${process.env.NODE_ENV || "dev"}`,
});

const app: Express = express();

// Connect to MongoDB
mongoose.run();

// Check for ebay_tokens.json file
if (!fs.existsSync("ebay_tokens.json")) {
  fs.writeFileSync("ebay_tokens.json", JSON.stringify({ generated_at: Date.now() }, null, 2));
}

app.use(
  express.json({ limit: "10mb" }),
  express.urlencoded({ limit: "10mb", extended: true }),
  morgan("dev"),
  // morgan("combined", { stream: accessLogStream }),
  corsMiddleware,
  authMiddleware,
  helmet()
);

app.get("/verification-token", (req, res) => {
  const challengeCode = req.query.challenge_code as string;
  const verificationToken = "EeNv89Ubsq8912NX6vJ5VP78D9cyeUlf";
  const endPoint = "https://gg75s5cc-5000.inc1.devtunnels.ms/verification-token";

  const hash = createHash("sha256");
  hash.update(challengeCode);
  hash.update(verificationToken);
  hash.update(endPoint);
  const responseHash = hash.digest("hex");
  const response = Buffer.from(responseHash).toString();

  return res.json({
    challengeResponse: response,
  });
});

app.post("/verification-token", (req, res) => {
  console.log(req.body);
  res.json({
    success: true,
  });
});

app.use("/api", router);

const port = process.env.PORT || 5000;

const httpServer = app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

// Graceful shutdown
["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => {
    console.log(`Received signal: ${signal}`);
    console.log("Shutting down server");
    mongoose.stop().then(() => {
      process.exit(0);
    });
  });
});

export { app };
