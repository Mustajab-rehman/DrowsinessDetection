export type EbayControllerCreateProductRequest = {
  sku: string;
  title: string;
  features: string[];
  cpu: string;
  description: string;
  upc: string;
  imageUrls: string[];
  condition: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  weight: {
    value: number;
    unit: string;
  };
  shipToLocationQuantity: number;
  fulfillmentTime: {
    value: number;
    unit: string;
  };
  listingPolicies: {
    fulfillmentPolicyId: string;
    paymentPolicyId: string;
    returnPolicyId: string;
  };
};

export type EbayControllerCreateOfferRequest = {
  sku: string;
  marketplaceId: string;
  priceFormat: string;
  listingDescription: string;
  availableQuantity: number;
  quantityLimitPerBuyer: number;
  price: {
    value: number;
    currency: string;
  };
  categoryId: string;
  merchantLocationKey: string;
  tax: {
    vatPercentage: number;
    applyTax: boolean;
    thirdPartyTaxCategory: string;
  };
  listingPolicies: {
    fulfillmentPolicyId: string;
    paymentPolicyId: string;
    returnPolicyId: string;
  };
};

export type EbayControllerUpdateOfferRequest = {
  availableQuantity: number;
  categoryId: string;
  listingDescription: string;
  price: {
    value: number;
    currency: string;
  };
  weight: {
    value: number;
    unit: string;
  };
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  packageType: string;
  quantityLimitPerBuyer: number;
  merchantLocationKey: string;
  includeCatalogProductDetails: boolean;
  globalShipping: boolean;
  pickupDropOff: boolean;
  localPickup: boolean;
  freightShipping: boolean;
  listingPolicies: {
    fulfillmentPolicyId: string;
    paymentPolicyId: string;
    returnPolicyId: string;
  };
};

export type EbayControllerCreateCustomPolicyRequest = {
  name: string;
  description: string;
  label: string;
  policyType: string;
};
