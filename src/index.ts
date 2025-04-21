import dotenv from "dotenv";
import express, { Express } from "express";
import { mongoose } from "./datasources";
import { router } from "./routes/index.route";


// Configure dotenv to use .env file like .env.dev or .env.prod
dotenv.config({
  path: `.env.${process.env.NODE_ENV || "dev"}`,
});

const app: Express = express();

// Connect to MongoDB
mongoose.run();

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
