import { Router } from "express";

// Routes
import { ReasonPhrases, StatusCodes } from "http-status-codes";

import { me } from "./me.route";

// Create a new router to handle all routes
const router: Router = Router();

// Define all routes
const routes: {
  [key: string]: (router: Router) => void;
} = {
  me,
};

// Loop through all routes and pass the router to each route
for (const route in routes) {
  // Add the route to the router
  const routeHandler = routes[route];
  const basePath = `/${route.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}`;
  const tempRouter = Router();

  routeHandler(tempRouter);
  router.use(basePath, tempRouter);
}

router.all("*", (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    message: ReasonPhrases.NOT_FOUND,
    status: StatusCodes.NOT_FOUND,
  });
});

// Export the router
export { router };
