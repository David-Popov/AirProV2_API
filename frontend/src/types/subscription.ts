export interface StripePlan {
  id: string;
  name: string;
  priceId: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
}

export interface StripeSubscriptionInfo {
  plan: string;
  status: string;
  isActive: boolean;
  currentPeriodEnd?: string;
  trialEndDate?: string;
  hasStripeSubscription: boolean;
}

export interface StripeConfig {
  publishableKey: string;
}

export interface CheckoutSessionResponse {
  url: string;
}

export interface PortalSessionResponse {
  url: string;
}
