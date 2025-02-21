import { ebayController } from "@/controllers/ebay.controller";
import { Router } from "express";
// import ebayToken from "../../ebay_tokens.json";

export const ebay = (router: Router) => {
  router.get("/auth/initial", ebayController.getApplicationAuthToken);
  router.get("/auth/ebay", ebayController.getUserAuthorizationUrl);
  router.get("/auth/ebay/callback", ebayController.handleAuthorizationCallback);
  router.get("/auth/ebay/callback/declined", ebayController.handleFallbackCallback);
  router.get("/auth/refresh-token", ebayController.handleRefreshToken);
  router.get("/auth/auth-file", ebayController.getAuthFile);

  router.get("/inventory", ebayController.getAllInventory);
  router.get("/inventory/get-all-categories", ebayController.getAllCategories);
  router.get("/inventory/get-item-aspects/:categoryId", ebayController.getItemAspects);
  router.post("/inventory/create-item", ebayController.createProduct);
  router.patch("/inventory/update-item", ebayController.updateProduct);
  router.delete("/inventory/delete-item/:sku", ebayController.deleteProduct);

  router.post("/create-offer", ebayController.createOffer);
  router.get("/get-all-offers/:sku", ebayController.getAllOffers);
  router.post("/publish-offer/:offerId", ebayController.publishOffer);
  router.patch("/update-offer/:offerId", ebayController.updateOffer);

  router.post("/create-custom-policy", ebayController.createCustomPolicy);
  router.get("/get-all-custom-policies", ebayController.getAllCustomPolicies);
  router.patch("/update-custom-policy/:policyId", ebayController.updateCustomPolicy);

  router.post("/create-fulfillment-policy", ebayController.createFulfillmentPolicy);
  router.get("/get-all-fulfillment-policies", ebayController.getAllFulfillmentPolicies);

  router.get("/get-locations", ebayController.getInventoryLocations);
  router.post("/create-location/:merchantLocationKey", ebayController.createInventoryLocation);

  router.post("/opt-in", ebayController.sellingPolicyManagementProgramOptIn);
  router.post("/create-payment-policy", ebayController.createPaymentPolicy);
  router.get("/get-all-payment-policies", ebayController.getAllPaymentPolicies);

  router.post("/create-return-policy", ebayController.createReturnPolicy);
  router.get("/get-all-return-policies", ebayController.getAllReturnPolicies);
};
