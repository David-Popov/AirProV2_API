import { apiClient } from './api';
import type { StripePlan, StripeSubscriptionInfo, StripeConfig } from '@/types';

class StripeService {
  /**
   * Get Stripe publishable key
   */
  async getConfig(): Promise<StripeConfig> {
    return apiClient.get<StripeConfig>('/Stripe/config');
  }

  /**
   * Get Premium plan info
   */
  async getPlan(): Promise<StripePlan> {
    return apiClient.get<StripePlan>('/Stripe/plan');
  }

  /**
   * Get current subscription status
   */
  async getSubscriptionStatus(): Promise<StripeSubscriptionInfo> {
    return apiClient.get<StripeSubscriptionInfo>('/Stripe/subscription-status');
  }

  /**
   * Create a checkout session for Premium subscription
   */
  async createCheckoutSession(): Promise<string> {
    const response = await apiClient.post<{ url: string }>('/Stripe/create-checkout-session', {});
    return response.url;
  }

  /**
   * Create a customer portal session for managing subscription
   */
  async createPortalSession(): Promise<string> {
    const response = await apiClient.post<{ url: string }>('/Stripe/create-portal-session', {});
    return response.url;
  }

  /**
   * Redirect to Stripe Checkout
   */
  async redirectToCheckout(): Promise<void> {
    const checkoutUrl = await this.createCheckoutSession();
    window.location.href = checkoutUrl;
  }

  /**
   * Redirect to Stripe Customer Portal
   */
  async redirectToPortal(): Promise<void> {
    const portalUrl = await this.createPortalSession();
    window.location.href = portalUrl;
  }
}

export const stripeService = new StripeService();
