import {
  EbayControllerCreateFulfillmentPolicyRequest,
  EbayControllerCreateLocationRequest,
  EbayControllerCreateOfferRequest,
  EbayControllerCreatePaymentPolicyRequest,
  EbayControllerCreatePolicyRequest,
  EbayControllerCreateProductRequest,
  EbayControllerCreateReturnPolicyRequest,
  EbayControllerUpdateOfferRequest,
} from "@/contracts/ebay.contract";
import { IBodyRequest, ICombinedRequest, IParamsRequest } from "@/contracts/request.contract";
import {
  exchangeCodeForAccessToken,
  getCredentials,
  getEbayAuthURL,
  getNormalAccessToken,
  getStoredEbayAccessToken,
  refreshEbayAccessToken,
} from "@/utils/ebay-helpers.util";
import { Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

const baseURL = "https://api.ebay.com";

export const ebayController = {
  getApplicationAuthToken: async (req: Request, res: Response) => {
    try {
      const credentials = await getNormalAccessToken();
      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: ReasonPhrases.OK,
        credentials,
      });
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: "Failed to get application token",
        details: error,
      });
    }
  },

  getUserAuthorizationUrl: async (req: Request, res: Response) => {
    try {
      const authUrl = getEbayAuthURL();
      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: ReasonPhrases.OK,
        authUrl,
      });
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: "Failed to get user authorization URL",
        details: error,
      });
    }
  },

  handleAuthorizationCallback: async (req: Request, res: Response) => {
    try {
      const { code } = req.query;
      const accessToken = await exchangeCodeForAccessToken(code as string);
      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: ReasonPhrases.OK,
        accessToken,
      });
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: "Failed to exchange code for access token",
        details: error,
      });
    }
  },

  handleFallbackCallback: async (req: Request, res: Response) => {
    try {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: StatusCodes.UNAUTHORIZED,
        message: ReasonPhrases.UNAUTHORIZED,
        error: "User denied access to eBay account",
      });
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: "Failed to handle fallback callback",
        details: error,
      });
    }
  },

  handleRefreshToken: async (req: Request, res: Response) => {
    try {
      const credentials = await refreshEbayAccessToken();
      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: ReasonPhrases.OK,
        credentials,
      });
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: "Failed to get application token",
        details: error,
      });
    }
  },

  getAuthFile: async (req: Request, res: Response) => {
    try {
      const credentials = await getCredentials();
      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: ReasonPhrases.OK,
        credentials,
      });
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: "Failed to get application token",
        details: error,
      });
    }
  },

  createProduct: async (req: IBodyRequest<EbayControllerCreateProductRequest>, res: Response) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      const body = req.body;

      const requestBody = {
        product: {
          title: body.title,
          aspects: {
            Feature: body.features,
            CPU: [body.cpu],
          },
          description: body.description,
          upc: [body.upc],
          imageUrls: body.imageUrls,
        },
        condition: body.condition,
        packageWeightAndSize: {
          dimensions: body.dimensions,
          weight: body.weight,
        },
        availability: {
          shipToLocationAvailability: {
            quantity: body.shipToLocationQuantity,
          },
        },
        fulfillmentTime: body.fulfillmentTime,
        shippingOptions: [
          {
            shippingCost: {
              value: "0.00",
              currency: "USD",
            },
            shippingServiceCode: "USPSPriorityMail",
            shipToLocations: [
              {
                countryCode: "US",
              },
            ],
            packageType: "USPSPriorityMailFlatRateBox",
          },
        ],
        listingPolicies: body.listingPolicies,
      };

      // Example API call to eBay Inventory API
      const response = await fetch(`${baseURL}/sell/inventory/v1/inventory_item/${body.sku}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        return res.status(response.status).json({
          status: response.status,
          statusText: response.statusText,
          message: "Failed to create item",
          body: await response.json(),
        });
      }

      return res.json({
        status: response.status,
        statusText: response.statusText,
        message: "Item created successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: "API call failed",
        details: error,
      });
    }
  },

  updateProduct: async (req: IBodyRequest<EbayControllerCreateProductRequest>, res: Response) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      const body = req.body;

      const requestBody = {
        product: {
          title: body.title,
          aspects: {
            Feature: body.features,
            CPU: [body.cpu],
          },
          description: body.description,
          upc: [body.upc],
          imageUrls: body.imageUrls,
        },
        condition: body.condition,
        packageWeightAndSize: {
          dimensions: body.dimensions,
          weight: body.weight,
        },
        availability: {
          shipToLocationAvailability: {
            quantity: body.shipToLocationQuantity,
          },
        },
        fulfillmentTime: body.fulfillmentTime,
        shippingOptions: [
          {
            shippingCost: {
              value: "0.00",
              currency: "USD",
            },
            shippingServiceCode: "USPSPriorityMail",
            shipToLocations: [
              {
                countryCode: "US",
              },
            ],
            packageType: "USPSPriorityMailFlatRateBox",
          },
        ],
        listingPolicies: body.listingPolicies,
      };

      // Example API call to eBay Inventory API
      const response = await fetch(`${baseURL}/sell/inventory/v1/inventory_item/${body.sku}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        return res.status(response.status).json({
          status: response.status,
          statusText: response.statusText,
          message: "Failed to update item",
          body: await response.json(),
        });
      }

      return res.json({
        status: response.status,
        statusText: response.statusText,
        message: "Item updated successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: "API call failed",
        details: error,
      });
    }
  },

  deleteProduct: async (req: IParamsRequest<{ sku: string }>, res: Response) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      const sku = req.params.sku;

      // Example API call to eBay Inventory API
      const response = await fetch(`${baseURL}/sell/inventory/v1/inventory_item/${sku}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
      });

      if (!response.ok) {
        return res.status(response.status).json({
          status: response.status,
          statusText: response.statusText,
          message: "Failed to delete item",
          body: await response.json(),
        });
      }

      return res.json({
        status: response.status,
        statusText: response.statusText,
        message: "Item deleted successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: "API call failed",
        details: error,
      });
    }
  },

  getAllInventory: async (req: Request, res: Response) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      // Example API call to eBay Inventory API
      const response = await fetch(`${baseURL}/sell/inventory/v1/inventory_item`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          message: "Failed to retrieve inventory items",
          status: response.status,
          statusText: response.statusText,
          data,
        });
      }

      return res.status(response.status).json({
        message: "Inventory items retrieved successfully",
        status: response.status,
        statusText: response.statusText,
        data,
      });
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: "API call failed",
        details: error,
      });
    }
  },

  getAllCategories: async (req: Request, res: Response) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      // Example API call to eBay Inventory API
      const response = await fetch(`${baseURL}/commerce/taxonomy/v1/category_tree/3`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          status: response.status,
          statusText: response.statusText,
          data,
        });
      }

      return res.status(response.status).json({
        status: response.status,
        statusText: response.statusText,
        data,
      });
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: "API call failed",
        details: error,
      });
    }
  },

  getItemAspects: async (req: IParamsRequest<{ categoryId: string }>, res: Response) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      const categoryId = req.params.categoryId;
      const response = await fetch(
        `${baseURL}/commerce/taxonomy/v1/category_tree/0/get_item_aspects_for_category?category_id=${categoryId}`,
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

      if (!response.ok) {
        return res.status(response.status).json({
          status: response.status,
          statusText: response.statusText,
          data,
        });
      }

      return res.status(response.status).json({
        status: response.status,
        statusText: response.statusText,
        data,
      });
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: "API call failed",
        details: error,
      });
    }
  },

  createOffer: async (req: IBodyRequest<EbayControllerCreateOfferRequest>, res: Response) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      const body = req.body;

      const requestBody = {
        sku: body.sku,
        marketplaceId: body.marketplaceId,
        format: body.priceFormat,
        listingDescription: body.listingDescription,
        availableQuantity: body.availableQuantity,
        quantityLimitPerBuyer: body.quantityLimitPerBuyer,
        pricingSummary: {
          price: body.price,
        },
        categoryId: body.categoryId,
        merchantLocationKey: body.merchantLocationKey,
        tax: body.tax,
        listingPolicies: body.listingPolicies,
      };

      // Example API call to eBay Inventory API
      const response = await fetch(`${baseURL}/sell/inventory/v1/offer`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({
          status: response.status,
          statusText: response.statusText,
          data,
        });
      }

      return res.json({
        status: response.status,
        statusText: response.statusText,
        message: "Offer created successfully",
        data,
      });
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: "API call failed",
        details: error,
      });
    }
  },

  getAllOffers: async (
    req: IParamsRequest<{
      sku: string;
    }>,
    res: Response
  ) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      const sku = req.params.sku;

      // Example API call to eBay Inventory API
      const response = await fetch(`${baseURL}/sell/inventory/v1/offer?sku=${sku}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({
          status: response.status,
          statusText: response.statusText,
          data,
        });
      }

      return res.status(response.status).json({
        status: response.status,
        statusText: response.statusText,
        data,
      });
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: "API call failed",
        details: error,
      });
    }
  },

  publishOffer: async (
    req: IParamsRequest<{
      offerId: string;
    }>,
    res: Response
  ) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      const offerId = req.params.offerId;

      // Example API call to eBay Inventory API
      const response = await fetch(`${baseURL}/sell/inventory/v1/offer/${offerId}/publish`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({
          status: response.status,
          statusText: response.statusText,
          data,
        });
      }

      return res.json({
        status: response.status,
        statusText: response.statusText,
        message: "Offer published successfully",
        data,
      });
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: "API call failed",
        details: error,
      });
    }
  },

  updateOffer: async (
    req: ICombinedRequest<unknown, EbayControllerUpdateOfferRequest, { offerId: string }>,
    res: Response
  ) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      const body = req.body;
      const offerId = req.params.offerId;

      const requestBody = {
        availableQuantity: body.availableQuantity,
        categoryId: body.categoryId,
        listingDescription: body.listingDescription,
        pricingSummary: {
          price: body.price,
        },
        packageWeightAndSize: {
          weight: body.weight,
          dimensions: body.dimensions,
          packageType: body.packageType,
        },
        quantityLimitPerBuyer: body.quantityLimitPerBuyer,
        merchantLocationKey: body.merchantLocationKey,
        includeCatalogProductDetails: body.includeCatalogProductDetails,
        shippingOptions: [
          {
            optionType: "DOMESTIC",
            costType: "FLAT_RATE",
            shippingServices: [
              {
                sortOrder: 1,
                shippingCarrierCode: "UPS",
                shippingServiceCode: "UPSGround",
                freeShipping: false,
                buyerResponsibleForShipping: false,
                buyerResponsibleForPickup: false,
              },
            ],
            packageHandlingCost: {
              value: "0.0",
              currency: "USD",
            },
            shippingDiscountProfileId: "0",
            shippingPromotionOffered: false,
          },
        ],
        globalShipping: body.globalShipping,
        pickupDropOff: body.pickupDropOff,
        localPickup: body.localPickup,
        freightShipping: body.freightShipping,
        listingPolicies: body.listingPolicies,
      };

      // Example API call to eBay Inventory API
      const response = await fetch(`${baseURL}/sell/inventory/v1/offer/${offerId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({
          status: response.status,
          statusText: response.statusText,
          data,
        });
      }

      return res.json({
        status: response.status,
        statusText: response.statusText,
        message: "Offer updated successfully",
        data,
      });
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: "API call failed",
        details: error,
      });
    }
  },

  createCustomPolicy: async (req: IBodyRequest<EbayControllerCreatePolicyRequest>, res: Response) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      const body = req.body;

      // Example API call to eBay Inventory API
      const response = await fetch(`${baseURL}/sell/account/v1/custom_policy`, {
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
        return res.status(response.status).json({
          status: response.status,
          statusText: response.statusText,
          data,
        });
      }
      return res.json({
        status: response.status,
        statusText: response.statusText,
        message: "Policy created successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: "API call failed",
        details: error,
      });
    }
  },

  getAllCustomPolicies: async (req: Request, res: Response) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      const response = await fetch(`${baseURL}/sell/account/v1/custom_policy`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({
          status: response.status,
          statusText: response.statusText,
          data,
        });
      }

      return res.json({
        status: response.status,
        statusText: response.statusText,
        data,
      });
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: "API call failed",
        details: error,
      });
    }
  },

  updateCustomPolicy: async (req: Request, res: Response) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      const body = req.body;
      const policyId = req.params.policyId;

      // Example API call to eBay Inventory API
      const response = await fetch(`${baseURL}/sell/account/v1/custom_policy/${policyId}`, {
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
        return res.status(response.status).json({
          status: response.status,
          statusText: response.statusText,
          data,
        });
      }
      return res.json({
        status: response.status,
        statusText: response.statusText,
        message: "Policy updated successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: "API call failed",
        details: error,
      });
    }
  },

  createFulfillmentPolicy: async (req: IBodyRequest<EbayControllerCreateFulfillmentPolicyRequest>, res: Response) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      const body = req.body;

      const requestBody = {
        categoryTypes: [
          {
            name: body.categoryTypeName,
          },
        ],
        marketplaceId: body.marketplaceId,
        name: body.name,
        globalShipping: body.globalShipping,
        handlingTime: body.handlingTime,
        shippingOptions: body.shippingOptions.map((option) => ({
          costType: option.shippingCostType,
          optionType: option.shippingServiceType,
          shippingServices: [
            {
              buyerResponsibleForShipping: option.buyerResponsibleForShipping,
              freeShipping: option.freeShipping,
              shippingCarrierCode: option.shippingCarrierCode,
              shippingServiceCode: option.shippingServiceCode,
              shippingCost: option.shippingCost,
            },
          ],
        })),
      };

      // Example API call to eBay Inventory API
      const response = await fetch(`${baseURL}/sell/account/v1/fulfillment_policy`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const data = await response.json();
        return res.status(response.status).json({
          status: response.status,
          statusText: response.statusText,
          data,
        });
      }
      return res.json({
        status: response.status,
        statusText: response.statusText,
        message: "Policy created successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: "API call failed",
        details: error,
      });
    }
  },

  getAllFulfillmentPolicies: async (req: Request, res: Response) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      // Example API call to eBay Inventory API
      const response = await fetch(`${baseURL}/sell/account/v1/fulfillment_policy?marketplace_id=EBAY_US`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          status: response.status,
          statusText: response.statusText,
          data,
        });
      }

      return res.json({
        status: response.status,
        statusText: response.statusText,
        data,
      });
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: "API call failed",
        details: error,
      });
    }
  },

  getInventoryLocations: async (req: Request, res: Response) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      // Example API call to eBay Inventory API
      const response = await fetch(`${baseURL}/sell/inventory/v1/location`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({
          status: response.status,
          statusText: response.statusText,
          data,
        });
      }

      return res.json({
        status: response.status,
        statusText: response.statusText,
        data,
      });
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: "API call failed",
        details: error,
      });
    }
  },

  createInventoryLocation: async (
    req: ICombinedRequest<
      unknown,
      EbayControllerCreateLocationRequest,
      {
        merchantLocationKey: string;
      }
    >,
    res: Response
  ) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      const body = req.body;
      const merchantLocationKey = req.params.merchantLocationKey;

      const requestBody = {
        location: {
          address: body.address,
          geoCoordinates: body.geoCoordinates,
        },
        phone: body.phone,
        locationTypes: body.locationTypes,
        operatingHours: body.operatingHours,
        fulfillmentCenterSpecifications: {
          sameDayShippingCutOffTimes: body.sameDayShippingCutOffTimes,
        },
      };

      // Example API call to eBay Inventory API
      const response = await fetch(`${baseURL}/sell/inventory/v1/location/${merchantLocationKey}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({
          status: response.status,
          statusText: response.statusText,
          data,
        });
      }
      return res.json({
        status: response.status,
        statusText: response.statusText,
        message: "Location created successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: "API call failed",
        details: error,
      });
    }
  },

  sellingPolicyManagementProgramOptIn: async (req: Request, res: Response) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      // Example API call to eBay Inventory API
      const response = await fetch(`${baseURL}/sell/account/v1/program/opt_in`, {
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

      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({
          status: response.status,
          statusText: response.statusText,
          data,
        });
      }
      return res.json({
        status: response.status,
        statusText: response.statusText,
        message: "Opt-in successful",
        data,
      });
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: "API call failed",
        details: error,
      });
    }
  },
  createPaymentPolicy: async (req: IBodyRequest<EbayControllerCreatePaymentPolicyRequest>, res: Response) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      const body = req.body;

      const requestBody = {
        name: body.name,
        marketplaceId: body.marketplaceId,
        categoryTypes: body.categoryTypes.map((type) => ({
          name: type,
        })),
        paymentMethods: body.paymentMethods.map((method) => ({
          paymentMethodType: method,
        })),
      };

      // Example API call to eBay Inventory API
      const response = await fetch(`${baseURL}/sell/account/v1/payment_policy`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({
          status: response.status,
          statusText: response.statusText,
          data,
        });
      }
      return res.json({
        status: response.status,
        statusText: response.statusText,
        message: "Policy created successfully",
        data,
      });
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: "API call failed",
        details: error,
      });
    }
  },

  getAllPaymentPolicies: async (req: Request, res: Response) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      // Example API call to eBay Inventory API
      const response = await fetch(`${baseURL}/sell/account/v1/payment_policy?marketplace_id=EBAY_US`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          status: response.status,
          statusText: response.statusText,
          data,
        });
      }

      return res.json({
        status: response.status,
        statusText: response.statusText,
        data,
        message: "Payment policies retrieved successfully",
      });
    } catch (error) {
      console.log(error);
      // res.status(500).json({ error: "API call failed" });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: "API call failed",
        details: error,
      });
    }
  },

  createReturnPolicy: async (req: IBodyRequest<EbayControllerCreateReturnPolicyRequest>, res: Response) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      const body = req.body;

      // Example API call to eBay Inventory API
      const response = await fetch(`${baseURL}/sell/account/v1/return_policy`, {
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

      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({
          status: response.status,
          statusText: response.statusText,
          data,
        });
      }
      return res.json({
        status: response.status,
        statusText: response.statusText,
        message: "Policy created successfully",
        data,
      });
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: "API call failed",
        details: error,
      });
    }
  },

  getAllReturnPolicies: async (req: Request, res: Response) => {
    try {
      const accessToken = await getStoredEbayAccessToken();

      // Example API call to eBay Inventory API
      const response = await fetch(`${baseURL}/sell/account/v1/return_policy?marketplace_id=EBAY_US`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          status: response.status,
          statusText: response.statusText,
          data,
        });
      }

      return res.json({
        status: response.status,
        statusText: response.statusText,
        data,
        message: "Return policies retrieved successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: "API call failed",
        details: error,
      });
    }
  },
};
