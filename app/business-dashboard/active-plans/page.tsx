"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  CalendarDays,
  Store,
  X,
  Users,
  CreditCard,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  getMyActiveSubscriptions,
  type ActiveSubscription,
} from "../../services/subscriptionService";

export default function ActivePlansPage() {
  const router = useRouter();

  const [subscriptions, setSubscriptions] = useState<
    ActiveSubscription[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSubscription, setSelectedSubscription] =
    useState<ActiveSubscription | null>(null);

  useEffect(() => {
    const fetchActivePlans = async () => {
      try {
        setLoading(true);
        const response = await getMyActiveSubscriptions();

        if (response?.success && Array.isArray(response.subscriptions)) {
          setSubscriptions(response.subscriptions);
        } else {
          setSubscriptions([]);
        }
      } catch (err) {
        console.error("FETCH ACTIVE PLANS:", err);
        setError("Unable to load active plans.");
      } finally {
        setLoading(false);
      }
    };

    fetchActivePlans();
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-7 sm:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-violet-600"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-violet-100 p-3 text-violet-600">
            <CreditCard size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Active Plans
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              View your active subscriptions and the stores using them.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center text-slate-500">
            Loading active plans...
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-white p-8 text-center text-red-600">
            {error}
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <CreditCard
              size={36}
              className="mx-auto text-slate-400"
            />
            <h2 className="mt-4 font-semibold text-slate-800">
              No Active Plans
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              You don't have any active subscriptions right now.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Your active subscriptions
              </p>
              <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700">
                {subscriptions.length} Plans
              </span>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {subscriptions.map((plan) => {
                const firstStore = plan.assignedStores[0];
                const extraStores = plan.assignedStores.length - 1;

                return (
                  <div
                    key={plan.subscriptionId}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Subscription Plan
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-slate-900">
                          {plan.planName}
                        </h2>
                      </div>

                      <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                        <CheckCircle2 size={14} />
                        Active
                      </span>
                    </div>

                    <div className="space-y-5 p-5">

                      {/* Features */}
                      <div>
                        <h3 className="mb-3 text-sm font-semibold text-slate-800">
                          Plan Features
                        </h3>

                        <div className="flex flex-wrap gap-2">
                          {plan.features.length > 0 ? (
                            plan.features.map((feature, index) => (
                              <span
                                key={index}
                                className="rounded-lg bg-violet-50 px-3 py-2 text-xs font-medium text-violet-700"
                              >
                                {feature}
                              </span>
                            ))
                          ) : (
                            <p className="text-sm text-slate-400">
                              No features available.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Plan Details */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">
                            Maximum Stores
                          </p>
                          <p className="mt-1 font-bold text-slate-900">
                            {plan.unlimitedStores
                              ? "Unlimited"
                              : plan.maxStores}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">
                            Activated Stores
                          </p>
                          <p className="mt-1 font-bold text-slate-900">
                            {plan.assignedStores.length}
                          </p>
                        </div>
                      </div>

                      {/* Expiry */}
                      <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                        <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                          <CalendarDays size={19} />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">
                            Expiry Date
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {formatDate(plan.expireAt)}
                          </p>
                        </div>
                      </div>

                      {/* Activated Stores */}
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                            <Store size={16} />
                            Active Stores
                          </h3>
                          <span className="text-xs text-slate-500">
                            {plan.assignedStores.length} Stores
                          </span>
                        </div>

                        {plan.assignedStores.length === 0 ? (
                          <p className="text-sm text-slate-400">
                            No stores assigned.
                          </p>
                        ) : (
                          <div className="flex items-center justify-between gap-3 rounded-xl bg-green-50 p-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {firstStore.storeName}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                ID: {firstStore.storeId}
                              </p>
                            </div>

                            {extraStores > 0 && (
                              <button
                                onClick={() =>
                                  setSelectedSubscription(plan)
                                }
                                className="shrink-0 rounded-lg bg-white px-3 py-2 text-sm font-bold text-violet-700 shadow-sm hover:bg-violet-100"
                              >
                                +{extraStores}
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* All Active Stores Modal */}
      {selectedSubscription && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedSubscription(null)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Active Stores
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedSubscription.planName}
                </p>
              </div>

              <button
                onClick={() => setSelectedSubscription(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[60vh] space-y-3 overflow-y-auto p-5">
              {selectedSubscription.assignedStores.map((store) => (
                <div
                  key={store._id}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"
                >
                  <div className="rounded-lg bg-violet-50 p-2 text-violet-600">
                    <Store size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {store.storeName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Store ID: {store.storeId}
                    </p>
                  </div>

                  <span className="ml-auto shrink-0 rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                    Active
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 p-4">
              <button
                onClick={() => setSelectedSubscription(null)}
                className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}