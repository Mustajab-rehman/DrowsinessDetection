import {
  exchangeCodeForAccessToken,
  getEbayAuthURL,
  getNormalAccessToken,
  getStoredEbayAccessToken,
  refreshEbayAccessToken,
} from "@/utils/ebay-helpers.util";
import { Router } from "express";
// import ebayToken from "../../ebay_tokens.json";

export const inventory = (router: Router) => {
  router.get("/auth/ebay/initial", async (req, res) => {
    const credentials = await getNormalAccessToken();
    return res.json({ credentials });
  });

  router.get("/auth/ebay", async (req, res) => {
    const authUrl = getEbayAuthURL();
    return res.json({ authUrl });
  });

  router.get("/auth/ebay/callback", async (req, res) => {
    const { code } = req.query;

    try {
      await exchangeCodeForAccessToken(code as string);
      res.send("Authentication successful! Refresh token saved.");
    } catch (error) {
      res.status(500).send("Authentication failed");
    }
  });

  router.get("/auth/ebay/callback/declined", async (req, res) => {
    console.log("User declined the authentication request");

    res.send("User declined the authentication request");
  });

  router.get("/auth/ebay/refreshtoken", async (req, res) => {
    const credentials = await refreshEbayAccessToken();

    res.json(credentials);
  });

  router.get("/inventory", async (req, res) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      // Example API call to eBay Inventory API
      const response = await fetch("https://api.ebay.com/sell/inventory/v1/inventory_item", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
      });

      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "API call failed" });
    }
  });

  router.get("/inventory/get-all-categories", async (req, res) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      // Example API call to eBay Inventory API
      const response = await fetch("https://api.ebay.com/commerce/taxonomy/v1/category_tree/3", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
      });

      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "API call failed" });
    }
  });

  router.get("/inventory/get-item-aspects", async (req, res) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      const categoryId = req.query.categoryId as string;
      // Example API call to eBay Inventory API
      // const response = await fetch("https://api.ebay.com/commerce/taxonomy/v1/category_tree/0/fetch_item_aspects", {
      const response = await fetch(
        `https://api.ebay.com/commerce/taxonomy/v1/category_tree/0/get_item_aspects_for_category?category_id=${categoryId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
            "Content-Language": "en-US",
            "Accept-Language": "en-US",
          },
        }
      );

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "API call failed" });
    }
  });

  router.post("/inventory/create-item", async (req, res) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      const body = req.body;

      const sku = req.query.sku as string;

      // Example API call to eBay Inventory API
      const response = await fetch(`https://api.ebay.com/sell/inventory/v1/inventory_item/${sku}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
        body: JSON.stringify(body),
      });

      res.json({
        status: response.status,
        statusText: response.statusText,
        message: "Item created successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "API call failed" });
    }
  });

  router.patch("/inventory/update-item", async (req, res) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      const body = req.body;
      const sku = req.query.sku as string;

      // Example API call to eBay Inventory API
      const response = await fetch(`https://api.ebay.com/sell/inventory/v1/inventory_item/${sku}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
        body: JSON.stringify(body),
      });

      res.json({
        status: response.status,
        statusText: response.statusText,
        message: "Item updated successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "API call failed" });
    }
  });

  router.delete("/inventory/delete-item", async (req, res) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      const sku = req.query.sku as string;

      // Example API call to eBay Inventory API
      const response = await fetch(`https://api.ebay.com/sell/inventory/v1/inventory_item/${sku}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
      });

      res.json({
        status: response.status,
        statusText: response.statusText,
        message: "Item deleted successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "API call failed" });
    }
  });

  router.post("/inventory/create-offer", async (req, res) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      const body = req.body;

      // Example API call to eBay Inventory API
      const response = await fetch(`https://api.ebay.com/sell/inventory/v1/offer`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        return res.status(response.status).json(data);
      }

      const dataaaa = await response.json();
      console.log(dataaaa);

      res.json({
        status: response.status,
        statusText: response.statusText,
        message: "Offer created successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "API call failed" });
    }
  });

  router.get("/inventory/get-all-offers", async (req, res) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      const sku = req.query.sku as string;

      // Example API call to eBay Inventory API
      const response = await fetch(`https://api.ebay.com/sell/inventory/v1/offer?sku=${sku}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
      });

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "API call failed" });
    }
  });

  router.post("/inventory/publish-offer", async (req, res) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      const offerId = req.query.offerId as string;

      // Example API call to eBay Inventory API
      const response = await fetch(`https://api.ebay.com/sell/inventory/v1/offer/${offerId}/publish`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        return res.status(response.status).json(data);
      }

      const dataaaa = await response.json();
      console.log(dataaaa);

      res.json({
        status: response.status,
        statusText: response.statusText,
        message: "Offer published successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "API call failed" });
    }
  });

  router.patch("/inventory/update-offer", async (req, res) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      const body = req.body;
      const offerId = req.query.offerId as string;

      // Example API call to eBay Inventory API
      const response = await fetch(`https://api.ebay.com/sell/inventory/v1/offer/${offerId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        return res.status(response.status).json(data);
      }

      res.json({
        status: response.status,
        statusText: response.statusText,
        message: "Offer updated successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "API call failed" });
    }
  });

  router.post("/inventory/create-custom-policy", async (req, res) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      const body = req.body;

      // Example API call to eBay Inventory API
      const response = await fetch(`https://api.ebay.com/sell/account/v1/custom_policy`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        return res.status(response.status).json(data);
      }
      res.json({
        status: response.status,
        statusText: response.statusText,
        message: "Policy created successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "API call failed" });
    }
  });

  router.get("/inventory/get-all-custom-policies", async (req, res) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      // Example API call to eBay Inventory API
      const response = await fetch(`https://api.ebay.com/sell/account/v1/custom_policy`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
      });

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "API call failed" });
    }
  });

  router.patch("/inventory/update-custom-policy", async (req, res) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      const body = req.body;
      const policyId = req.query.policyId as string;

      // Example API call to eBay Inventory API
      const response = await fetch(`https://api.ebay.com/sell/account/v1/custom_policy/${policyId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        return res.status(response.status).json(data);
      }
      res.json({
        status: response.status,
        statusText: response.statusText,
        message: "Policy updated successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "API call failed" });
    }
  });

  router.post("/inventory/create-fulfillment-policy", async (req, res) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      const body = req.body;

      // Example API call to eBay Inventory API
      const response = await fetch(`https://api.ebay.com/sell/account/v1/fulfillment_policy`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        return res.status(response.status).json(data);
      }
      res.json({
        status: response.status,
        statusText: response.statusText,
        message: "Policy created successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "API call failed" });
    }
  });

  router.get("/inventory/get-all-fulfillment-policies", async (req, res) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      // Example API call to eBay Inventory API
      const response = await fetch(`https://api.ebay.com/sell/account/v1/fulfillment_policy?marketplace_id=EBAY_US`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
      });

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "API call failed" });
    }
  });

  router.get("/inventory/get-inventory-location", async (req, res) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      // Example API call to eBay Inventory API
      const response = await fetch(`https://api.ebay.com/sell/inventory/v1/location`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
      });

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "API call failed" });
    }
  });

  router.post("/inventory/create-inventory-location", async (req, res) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      const body = req.body;
      const merchantLocationKey = req.query.merchantLocationKey as string;

      // Example API call to eBay Inventory API
      const response = await fetch(`https://api.ebay.com/sell/inventory/v1/location/${merchantLocationKey}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        return res.status(response.status).json(data);
      }
      res.json({
        status: response.status,
        statusText: response.statusText,
        message: "Location created successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "API call failed" });
    }
  });

  router.post("/inventory/opt-in", async (req, res) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      // Example API call to eBay Inventory API
      const response = await fetch(`https://api.ebay.com/sell/account/v1/program/opt_in`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
        body: JSON.stringify({
          programType: "SELLING_POLICY_MANAGEMENT",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        return res.status(response.status).json(data);
      }
      res.json({
        status: response.status,
        statusText: response.statusText,
        message: "Opt-in successful",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "API call failed" });
    }
  });

  router.post("/inventory/create-payment-policy", async (req, res) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      const body = req.body;

      // Example API call to eBay Inventory API
      const response = await fetch(`https://api.ebay.com/sell/account/v1/payment_policy`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        return res.status(response.status).json(data);
      }
      res.json({
        status: response.status,
        statusText: response.statusText,
        message: "Policy created successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "API call failed" });
    }
  });

  router.get("/inventory/get-all-payment-policies", async (req, res) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      // Example API call to eBay Inventory API
      const response = await fetch(`https://api.ebay.com/sell/account/v1/payment_policy?marketplace_id=EBAY_US`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
      });

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "API call failed" });
    }
  });

  router.post("/inventory/create-return-policy", async (req, res) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      const body = req.body;

      // Example API call to eBay Inventory API
      const response = await fetch(`https://api.ebay.com/sell/account/v1/return_policy`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        return res.status(response.status).json(data);
      }
      res.json({
        status: response.status,
        statusText: response.statusText,
        message: "Policy created successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "API call failed" });
    }
  });

  router.get("/inventory/get-all-return-policies", async (req, res) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      // Example API call to eBay Inventory API
      const response = await fetch(`https://api.ebay.com/sell/account/v1/return_policy?marketplace_id=EBAY_US`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
      });

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "API call failed" });
    }
  });
};
