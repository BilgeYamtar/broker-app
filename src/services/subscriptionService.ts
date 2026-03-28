/**
 * RevenueCat subscription service.
 *
 * Native module — requires EAS build (not OTA-deliverable).
 * Uses dynamic import to avoid crashes on builds without the module.
 */

import { Platform } from "react-native";
import Constants from "expo-constants";

// API key from app.config.ts → extra.revenueCatApiKey
const REVENUECAT_API_KEY =
  Constants.expoConfig?.extra?.revenueCatApiKey ?? "";

export const PRODUCT_IDS = {
  monthly: "com.yukportfoyu.app.premium.monthly",
  yearly: "com.yukportfoyu.app.premium.yearly",
} as const;

export const FREE_LIMITS = {
  maxVessels: 3,
  maxCargoes: 5,
  maxFeasibilityPerDay: 3,
} as const;

export interface SubscriptionInfo {
  isPremium: boolean;
  productId: string | null;
  expirationDate: string | null;
  willRenew: boolean;
}

let initialized = false;

export async function initializeRevenueCat(): Promise<void> {
  if (initialized) return;

  try {
    const Purchases = (await import("react-native-purchases")).default;
    Purchases.configure({ apiKey: REVENUECAT_API_KEY });
    initialized = true;
  } catch {
    // Module not available — running on a build without native module
    console.warn("RevenueCat not available — subscription features disabled");
  }
}

export async function getSubscriptionInfo(): Promise<SubscriptionInfo> {
  try {
    const Purchases = (await import("react-native-purchases")).default;
    const customerInfo = await Purchases.getCustomerInfo();

    const activeEntitlements = customerInfo.entitlements.active;
    const premiumEntitlement = activeEntitlements["premium"];

    if (premiumEntitlement) {
      return {
        isPremium: true,
        productId: premiumEntitlement.productIdentifier,
        expirationDate: premiumEntitlement.expirationDate,
        willRenew: premiumEntitlement.willRenew,
      };
    }

    return { isPremium: false, productId: null, expirationDate: null, willRenew: false };
  } catch {
    return { isPremium: false, productId: null, expirationDate: null, willRenew: false };
  }
}

export interface PackageInfo {
  identifier: string;
  productId: string;
  priceString: string;
  price: number;
  title: string;
  description: string;
  period: "monthly" | "yearly";
}

export async function getAvailablePackages(): Promise<PackageInfo[]> {
  try {
    const Purchases = (await import("react-native-purchases")).default;
    const offerings = await Purchases.getOfferings();

    if (!offerings.current) return [];

    const packages: PackageInfo[] = [];

    for (const pkg of offerings.current.availablePackages) {
      const product = pkg.product;
      const isYearly =
        product.identifier === PRODUCT_IDS.yearly ||
        pkg.packageType === "ANNUAL";

      packages.push({
        identifier: pkg.identifier,
        productId: product.identifier,
        priceString: product.priceString,
        price: product.price,
        title: product.title,
        description: product.description,
        period: isYearly ? "yearly" : "monthly",
      });
    }

    return packages;
  } catch {
    return [];
  }
}

export async function purchasePackage(
  packageIdentifier: string
): Promise<SubscriptionInfo> {
  try {
    const Purchases = (await import("react-native-purchases")).default;
    const offerings = await Purchases.getOfferings();

    if (!offerings.current) {
      throw new Error("No offerings available");
    }

    const pkg = offerings.current.availablePackages.find(
      (p) => p.identifier === packageIdentifier
    );

    if (!pkg) {
      throw new Error("Package not found");
    }

    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const premiumEntitlement = customerInfo.entitlements.active["premium"];

    if (premiumEntitlement) {
      return {
        isPremium: true,
        productId: premiumEntitlement.productIdentifier,
        expirationDate: premiumEntitlement.expirationDate,
        willRenew: premiumEntitlement.willRenew,
      };
    }

    return { isPremium: false, productId: null, expirationDate: null, willRenew: false };
  } catch (err) {
    // User cancelled or error
    throw err;
  }
}

export async function restorePurchases(): Promise<SubscriptionInfo> {
  try {
    const Purchases = (await import("react-native-purchases")).default;
    const customerInfo = await Purchases.restorePurchases();
    const premiumEntitlement = customerInfo.entitlements.active["premium"];

    if (premiumEntitlement) {
      return {
        isPremium: true,
        productId: premiumEntitlement.productIdentifier,
        expirationDate: premiumEntitlement.expirationDate,
        willRenew: premiumEntitlement.willRenew,
      };
    }

    return { isPremium: false, productId: null, expirationDate: null, willRenew: false };
  } catch {
    return { isPremium: false, productId: null, expirationDate: null, willRenew: false };
  }
}
