import { Router } from "express";
import { SellingPartner } from "amazon-sp-api";

const spClient = new SellingPartner({
  region: "eu", // The region to use for the SP-API endpoints ("eu", "na" or "fe")
  refresh_token: process.env.AMAZON_REFRESH_TOKEN,
  options: {
    use_sandbox: true,
  },
});

export const amazon = (router: Router) => {
  router.get("/", async (req, res) => {
    try {
      let response = await spClient.callAPI({
        operation: "getMarketplaceParticipations",
        endpoint: "sellers",
      });
      console.log(response);
      res.send(response);
    } catch (e) {
      console.log(e);
      res.send(e);
    }
  });

  router.get("/orders", async (req, res) => {
    try {
      const spClient = new SellingPartner({
        region: "eu", // The region to use for the SP-API endpoints ("eu", "na" or "fe")
        refresh_token: process.env.AMAZON_REFRESH_TOKEN,
        options: {
          use_sandbox: true,
        },
      });
      let response = await spClient.callAPI({
        operation: "listCatalogCategories",
        endpoint: "catalogItems",
        query: {
          MarketplaceId: "A1PA6795UKMFR9",
          ASIN: "B084DWG2VQ",
        },
      });
      console.log(response);
      res.send(response);
    } catch (e) {
      console.log(e);
      res.send(e);
    }
  });
};
