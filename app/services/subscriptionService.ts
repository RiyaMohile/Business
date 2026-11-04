
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const subscriptionApi = axios.create({
  baseURL: `${API_BASE_URL}/v2/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Authenticated subscription APIs ke liye token
subscriptionApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export interface SubscriptionPlan {
  _id: string;
  name: string;
  price: number;
  currency: string;
  durationMonths: number;
  maxStores: number | null;
  unlimitedStores: boolean;
  maxPosts: number;
  features: string[];
  isActive: boolean;
}

export interface CreateSubscriptionOrderResponse {
  success: boolean;
  message?: string;
  purchaseId: string;
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  store?: {
    storeId: string;
    storeName?: string;
  };
  plan?: {
    planId: string;
    name: string;
    price: number;
    durationMonths: number;
  };
}

export interface VerifySubscriptionPaymentPayload {
  purchaseId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
export interface AssignedStore {
  _id: string;
  storeId: string;
  storeName: string;
}

export interface AvailableSubscription {
  subscriptionId: string;
  planId: string;
  planName: string;
  price: number;
  currency: string;
  durationMonths: number;
  expireAt: string;
  maxStores: number | null;
  unlimitedStores: boolean;
  usedStores: number;
  remainingStores: number | null;
  assignedStores: AssignedStore[];
}

// GET all available subscription plans
export const getAvailableSubscriptionPlans = async () => {
  const response = await subscriptionApi.get("/plans/available");
  return response.data;
};

// POST create Razorpay subscription order
export const createSubscriptionOrder = async (
  storeId: string,
  planId: string
): Promise<CreateSubscriptionOrderResponse> => {
  
  const response = await subscriptionApi.post(
    "/subscriptions/create-order",
    {
    planId,
    ...(storeId?.trim() ? { storeId: storeId.trim() } : {}),
  }
  );

  return response.data;
};

// POST verify Razorpay subscription payment
export const verifySubscriptionPayment = async (
  payload: VerifySubscriptionPaymentPayload
) => {
  const response = await subscriptionApi.post(
    "/subscriptions/verify-payment",
    payload
  );

  return response.data;
};


export const getCurrentSubscription = async () => {
  const response = await subscriptionApi.get(
    "http://localhost:5000/v1/api/subscription/current"
  );

  return response.data;
};

// GET available existing subscriptions
export const getAvailableSubscriptions = async () => {
  const response = await subscriptionApi.get(
    "/subscriptions/available-for-store"
  );

  return response.data;
};

// POST assign existing subscription to another store
export const assignStoreToSubscription = async (
  subscriptionId: string,
  storeId: string
) => {
  const response = await subscriptionApi.post(
    "/subscriptions/assign-store",
    {
      subscriptionId,
      storeId,
    }
  );

  return response.data;
};

// Active Subscription Interface
export interface ActiveSubscription {
  subscriptionId: string;
  planId: string;
  planName: string;
  expireAt: string;
  maxStores: number | null;
  unlimitedStores: boolean;
  features: string[];
  assignedStores: AssignedStore[];
}

// GET my active subscriptions
export const getMyActiveSubscriptions = async () => {
  const response = await subscriptionApi.get(
    "/subscriptions/my-active"
  );

  return response.data;
};