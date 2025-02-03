import { authGuard } from "@/guards";
import { Router } from "express";

export const me = (router: Router) => {
  // Route for user registration
  router.get("/", authGuard.isAuth, async (req, res) => {
    try {
      const { user } = req.context;
      return res.status(200).json({
        message: "User details fetched successfully",
        status: 200,
        data: user,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
        status: 500,
      });
    }
  });
};
