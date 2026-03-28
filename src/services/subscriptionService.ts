/**
 * RevenueCat subscription service.
 *
 * DISABLED: RevenueCat is not initialized until App Store Connect setup is complete.
 * Set REVENUECAT_ENABLED = true to re-enable after configuring products in ASC.
 *
 * While disabled all functions return free-tier defaults and never touch the
 * native Purchases module, so the app will not crash.
 */

const REVENUECAT_ENABLED = false;

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

const FREE_INFO: SubscriptionInfo = {
  isPremium: false,
  productId: null,
  expirationDate: null,
  willRenew: false,
};

let initialized = false;

export async function initializeRevenueCat(): Promise<void> {
  if (!REVENUECAT_ENABLED || initialized) return;

  try {
    const Constants = (await import("expo-constants")).default;
    const apiKey = Constants.expoConfig?.extra?.revenueCatApiKey ?? "";
    if (!apiKey) return;

    const Purchases = (await import("react-native-purchases")).default;
    Purchases.configure({ apiKey });
    initialized = true;
  } catch {
    console.warn("RevenueCat not available — subscription features disabled");
  }
}

export async function getSubscriptionInfo(): Promise<SubscriptionInfo> {
  if (!REVENUECAT_ENABLED || !initialized) return FREE_INFO;

  try {
    const Purchases = (await import("react-native-purchases")).default;
    const customerInfo = await Purchases.getCustomerInfo();

    const premiumEntitlement = customerInfo.entitlements.active["premium"];

    if (premiumEntitlement) {
      return {
        isPremium: true,
        productId: premiumEntitlement.productIdentifier,
        expirationDate: premiumEntitlement.expirationDate,
        willRenew: premiumEntitlement.willRenew,
      };
    }

    return FREE_INFO;
  } catch {
    return FREE_INFO;
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
  if (!REVENUECAT_ENABLED || !initialized) return [];

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
  if (!REVENUECAT_ENABLED || !initialized) {
    throw new Error("RevenueCat not enabled");
  }

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

  return FREE_INFO;
}

export async function restorePurchases(): Promise<SubscriptionInfo> {
  if (!REVENUECAT_ENABLED || !initialized) return FREE_INFO;

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

    return FREE_INFO;
  } catch {
    return FREE_INFO;
  }
}
