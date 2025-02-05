import { NextFunction, Response } from "express";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

import { IContextRequest, IUserRequest } from "@/contracts/request.contract";
import axios from "axios";

export const eBayAuthGuard = {
  isAuth: async ({ context: { user } }: IContextRequest<IUserRequest>, res: Response, next: NextFunction) => {
    const authToken =
      "v^1.1#i^1#f^0#p^3#r^0#I^3#t^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";

    let response;
    // try {
    //   response = await axios.get("https://apiz.ebay.com/commerce/identity/v1/user/", {
    //     headers: {
    //       Authorization: `Bearer ${authToken}`,
    //     },
    //   });

    //   console.log(response.data);
    //   next();
    // } catch (e) {
    //   console.log(e);
    //   return res.status(StatusCodes.UNAUTHORIZED).json({
    //     message: ReasonPhrases.UNAUTHORIZED,
    //     status: StatusCodes.UNAUTHORIZED,
    //   });
    // }
    next();
  },
};
