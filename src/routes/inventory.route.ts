import { Router } from "express";
import EbayAuthToken from "ebay-oauth-nodejs-client";
import axios from "axios"; // Make sure to install axios
import fs from "fs";

const refreshToken = "v^1.1#i^1#f^0#p^3#I^3#r^1#t^Ul4xMF84OkM1RDg5MUExM0MyNDE2NTIzODU4MTUxOEIyQTBGOUM5XzFfMSNFXjI2MA==";

export const inventory = (router: Router) => {
  router.get("/auth/ebay", async (req, res) => {
    const scopes = [
      "https://api.ebay.com/oauth/api_scope",
      "https://api.ebay.com/oauth/api_scope/sell.inventory",
      // Add other required scopes
    ];

    const ebayAuthToken = new EbayAuthToken({
      clientId: process.env.EBAY_CLIENT_ID!,
      clientSecret: process.env.EBAY_CLIENT_SECRET!,
      redirectUri: process.env.EBAY_REDIRECT_URI!,
    });

    const options: { prompt?: "login" | "consent" | undefined; state?: string | undefined } = {
      prompt: "login",
    };

    const authUrl = ebayAuthToken.generateUserAuthorizationUrl("PRODUCTION", scopes, options);

    return res.json({ authUrl });
  });

  router.get("/auth/ebay/callback", async (req, res) => {
    const { code } = req.query;

    try {
      const scopes = [
        "https://api.ebay.com/oauth/api_scope",
        "https://api.ebay.com/oauth/api_scope/sell.inventory",
        // Add other required scopes
      ];

      const ebayAuthToken = new EbayAuthToken({
        clientId: process.env.EBAY_CLIENT_ID!,
        clientSecret: process.env.EBAY_CLIENT_SECRET!,
        redirectUri: process.env.EBAY_REDIRECT_URI!,
      });

      // Exchange code for tokens
      const credentials = await ebayAuthToken.exchangeCodeForAccessToken("PRODUCTION", code as string);
      const parsedCredentials = JSON.parse(credentials);

      // Store in a file
      fs.writeFileSync("ebay_tokens.json", JSON.stringify({ ...parsedCredentials, generated_at: Date.now() }, null, 2));

      // Store refresh_token securely (e.g., database)
      console.log("Refresh Token:", parsedCredentials.refresh_token);

      res.send("Authentication successful! Refresh token saved.");
    } catch (error) {
      res.status(500).send("Authentication failed");
    }
  });

  router.get("/auth/ebay/callback/declined", async (req, res) => {
    res.send("User declined the authentication request");
  });

  const getEbayAccessToken = async (refreshToken: string) => {
    const scopes = [
      "https://api.ebay.com/oauth/api_scope",
      "https://api.ebay.com/oauth/api_scope/sell.inventory",
      // Add other required scopes
    ];

    const ebayAuthToken = new EbayAuthToken({
      clientId: process.env.EBAY_CLIENT_ID!,
      clientSecret: process.env.EBAY_CLIENT_SECRET!,
      redirectUri: process.env.EBAY_REDIRECT_URI!,
    });

    // Generate new access token using refresh token
    const token = await ebayAuthToken.getAccessToken("PRODUCTION", refreshToken, scopes);
    const { access_token, expires_in } = JSON.parse(token);
    return access_token;
  };

  router.get("/auth/ebay/refreshtoken", async (req, res) => {
    const accessToken = await getEbayAccessToken(refreshToken);
    res.json({ accessToken });
  });

  router.get("/inventory", async (req, res) => {
    try {
      const accessToken = await getEbayAccessToken(refreshToken);

      console.log("Access Token:", accessToken);

      // Example API call to eBay Inventory API
      const response = await fetch("https://api.ebay.com/sell/inventory/v1/inventory_item", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "API call failed" });
    }
  });
};
