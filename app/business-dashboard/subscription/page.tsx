
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  Store as StoreIcon,
  CheckCircle,
  Clock,
  Plus,
  RefreshCw,
} from "lucide-react";

import { getMyStores } from "@/app/services/storeApi";

import {
  getAvailableSubscriptions,
  assignStoreToSubscription,
  type AvailableSubscription,
} from "../../services/subscriptionService";

interface Plan {
  _id?: string;
  name?: string;
}

interface PopulatedSubscription {
  _id?: string;
  planId?: string | Plan;
  status?: string;
  expireAt?: string | null;
}

interface StoreData {
  _id: string;
  storeId: string;
  storeName: string;
  subscription?: {
    subscriptionId?: string | PopulatedSubscription | null;
    expireAt?: string | null;
  } | null;
}

export default function SubscriptionPage() {
  const router = useRouter();

  const [stores, setStores] = useState<StoreData[]>([]);
  const [availablePlans, setAvailablePlans] = useState<
    AvailableSubscription[]
  >([]);

  const [selectedStores, setSelectedStores] = useState<
    Record<string, string>
  >({});

  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [storeResponse, subscriptionResponse] = await Promise.all([
        getMyStores(),
        getAvailableSubscriptions(),
      ]);

      if (
        storeResponse?.success &&
        Array.isArray(storeResponse.stores)
      ) {
        setStores(storeResponse.stores);
      } else {
        setStores([]);
      }

      if (
        subscriptionResponse?.success &&
        Array.isArray(subscriptionResponse.subscriptions)
      ) {
        setAvailablePlans(subscriptionResponse.subscriptions);
      } else {
        setAvailablePlans([]);
      }
    } catch (err) {
      console.error("LOAD SUBSCRIPTION DATA:", err);
      setError("Unable to load subscription details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Check whether a store has an active subscription
  const getStoreSubscription = (store: StoreData) => {
    const subscription = store.subscription;

    const subscriptionId =
      typeof subscription?.subscriptionId === "object"
        ? subscription.subscriptionId?._id
        : subscription?.subscriptionId;

    const expiry = subscription?.expireAt
      ? new Date(subscription.expireAt).getTime()
      : NaN;

    const isActive =
      Boolean(subscriptionId) &&
      Number.isFinite(expiry) &&
      expiry > Date.now();

    let planName = "";

    if (
      subscription?.subscriptionId &&
      typeof subscription.subscriptionId === "object"
    ) {
      const plan = subscription.subscriptionId.planId;

      if (typeof plan === "object" && plan !== null) {
        planName = plan.name || "";
      }
    }

    return {
      isActive,
      expiry,
      planName,
    };
  };

  // Only stores without an active subscription can be assigned
  const inactiveStores = stores.filter(
    (store) => !getStoreSubscription(store).isActive
  );

  const handleAssignStore = async (subscriptionId: string) => {
    const selectedStoreId = selectedStores[subscriptionId];

    if (!selectedStoreId) {
      alert("Please select a store first.");
      return;
    }

    try {
      setAssigningId(subscriptionId);

      const response = await assignStoreToSubscription(
        subscriptionId,
        selectedStoreId
      );

      if (!response?.success) {
        throw new Error(response?.message || "Unable to activate store.");
      }

      alert(response.message || "Store activated successfully.");

      setSelectedStores((prev) => ({
        ...prev,
        [subscriptionId]: "",
      }));

      await loadData();
    } catch (err: unknown) {
      console.error("ASSIGN STORE ERROR:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Unable to activate store.";

      alert(message);
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-violet-600"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {/* Page Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-100 p-3 text-violet-600">
              <CreditCard size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Store Subscriptions
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage your stores and subscription plans.
              </p>
            </div>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="rounded-xl bg-white p-8 text-center text-slate-500">
            Loading subscription details...
          </div>
        ) : error ? (
          <div className="rounded-xl bg-white p-8 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadData}
              className="mt-4 rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* SECTION 1: YOUR STORES */}
            <section className="mb-10">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Your Stores
                  </h2>
                  <p className="text-sm text-slate-500">
                    All your stores and their current subscription status.
                  </p>
                </div>

                <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700">
                  {stores.length} Stores
                </span>
              </div>

              {stores.length === 0 ? (
                <div className="rounded-2xl border bg-white p-8 text-center">
                  <StoreIcon className="mx-auto text-slate-400" size={32} />
                  <p className="mt-3 font-semibold text-slate-800">
                    No stores found
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Create a store to manage its subscription.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {stores.map((store) => {
                    const subscription = getStoreSubscription(store);

                    return (
                      <div
                        key={store._id}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {store.storeName}
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                              Store ID: {store.storeId}
                            </p>
                          </div>

                          {subscription.isActive ? (
                            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                              <CheckCircle size={13} />
                              Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                              <Clock size={13} />
                              Inactive
                            </span>
                          )}
                        </div>

                        <div className="mt-5 border-t border-slate-100 pt-4">
                          {subscription.isActive ? (
                            <>
                              <p className="text-xs text-slate-500">
                                Current Plan
                              </p>
                              <p className="mt-1 font-semibold text-slate-800">
                                {subscription.planName || "Active Subscription"}
                              </p>

                              <p className="mt-3 text-xs text-slate-500">
                                Expires on
                              </p>
                              <p className="mt-1 text-sm font-medium text-slate-700">
                                {new Date(
                                  subscription.expiry
                                ).toLocaleDateString("en-IN")}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-slate-500">
                              No active subscription assigned to this store.
                            </p>
                          )}

                          <button
                            onClick={() =>
                              router.push(
                                `/business-dashboard/plans?storeId=${encodeURIComponent(
                                  store.storeId
                                )}`
                              )
                            }
                            className="mt-4 w-full rounded-xl border border-violet-200 px-4 py-2.5 text-sm font-semibold text-violet-700 hover:bg-violet-50"
                          >
                            {subscription.isActive
                              ? "Explore Plans"
                              : "Activate with New Plan"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* SECTION 2: AVAILABLE EXISTING PLANS */}
            <section className="mb-10">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Available Existing Plans
                </h2>
                <p className="text-sm text-slate-500">
                  Use your already purchased subscription to activate another store.
                </p>
              </div>

              {availablePlans.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                  <CreditCard
                    className="mx-auto text-slate-400"
                    size={32}
                  />
                  <p className="mt-3 font-semibold text-slate-800">
                    No reusable plans available
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Your existing subscriptions may be expired or have reached
                    their store limit.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5">
                  {availablePlans.map((plan) => (
                    <div
                      key={plan.subscriptionId}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">
                            {plan.planName}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            Subscription ID: {plan.subscriptionId}
                          </p>
                        </div>

                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                          Available
                        </span>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">
                            Activated Stores
                          </p>
                          <p className="mt-1 text-lg font-bold text-slate-900">
                            {plan.usedStores}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">
                            Maximum Stores
                          </p>
                          <p className="mt-1 text-lg font-bold text-slate-900">
                            {plan.unlimitedStores
                              ? "Unlimited"
                              : plan.maxStores}
                          </p>
                        </div>

                        <div className="rounded-xl bg-violet-50 p-3">
                          <p className="text-xs text-violet-600">
                            Remaining Slots
                          </p>
                          <p className="mt-1 text-lg font-bold text-violet-700">
                            {plan.unlimitedStores
                              ? "Unlimited"
                              : plan.remainingStores}
                          </p>
                        </div>
                      </div>

                      {/* Already Activated Stores */}
                      <div className="mt-5">
                        <p className="mb-3 text-sm font-semibold text-slate-800">
                          Stores using this subscription
                        </p>

                        {plan.assignedStores.length === 0 ? (
                          <p className="text-sm text-slate-500">
                            No stores activated yet.
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {plan.assignedStores.map((store) => (
                              <span
                                key={store._id}
                                className="rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700"
                              >
                                {store.storeName} ({store.storeId})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Activate Another Store */}
                      {inactiveStores.length > 0 ? (
                        <div className="mt-5 border-t border-slate-100 pt-5">
                          <label className="mb-2 block text-sm font-semibold text-slate-800">
                            Select an inactive store
                          </label>

                          <div className="flex flex-col gap-3 sm:flex-row">
                            <select
                              value={selectedStores[plan.subscriptionId] || ""}
                              onChange={(e) =>
                                setSelectedStores((prev) => ({
                                  ...prev,
                                  [plan.subscriptionId]: e.target.value,
                                }))
                              }
                              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500"
                            >
                              <option value="">Choose a store</option>

                              {inactiveStores.map((store) => (
                                <option
                                  key={store._id}
                                  value={store.storeId}
                                >
                                  {store.storeName} ({store.storeId})
                                </option>
                              ))}
                            </select>

                            <button
                              onClick={() =>
                                handleAssignStore(plan.subscriptionId)
                              }
                              disabled={
                                !selectedStores[plan.subscriptionId] ||
                                assigningId === plan.subscriptionId
                              }
                              className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Plus size={17} />
                              {assigningId === plan.subscriptionId
                                ? "Activating..."
                                : "Activate Store"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-500">
                          All your stores already have active subscriptions.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* SECTION 3: EXPLORE NEW PLANS */}
            <section className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white sm:p-8">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-bold">
                    Need More Store Subscriptions?
                  </h2>
                  <p className="mt-2 text-sm text-violet-100">
                    Explore new plans and activate subscriptions for your stores.
                  </p>
                </div>

                <button
                  onClick={() =>
                    router.push("/business-dashboard/plans")
                  }
                  className="shrink-0 rounded-xl bg-white px-5 py-3 text-sm font-bold text-violet-700 hover:bg-violet-50"
                >
                  Explore New Plans
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
