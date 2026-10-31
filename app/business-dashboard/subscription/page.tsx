
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard } from "lucide-react";
import { getMyStores } from "@/app/services/storeApi";

interface StoreData {
  _id: string;
  storeId: string;
  storeName: string;
  subscription?: {
    subscriptionId?: string | { _id?: string } | null;
    expireAt?: string | null;
  } | null;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStores = async () => {
      try {
        const response = await getMyStores();

        if (response?.success && Array.isArray(response.stores)) {
          setStores(response.stores);
        } else {
          setError("Unable to load stores.");
        }
      } catch (err) {
        console.error("LOAD SUBSCRIPTION STORES:", err);
        setError("Unable to load stores. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadStores();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-violet-600"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-violet-100 p-3 text-violet-600">
            <CreditCard size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Store Subscriptions
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your store plans.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="rounded-xl bg-white p-6 text-slate-500">
            Loading stores...
          </p>
        ) : error ? (
          <p className="rounded-xl bg-white p-6 text-red-600">
            {error}
          </p>
        ) : stores.length === 0 ? (
          <div className="rounded-xl border bg-white p-8 text-center">
            <p className="font-semibold text-slate-800">
              No stores found
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Create a store to manage its subscription.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {stores.map((store) => {
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

              return (
                <div
                  key={store._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <h2 className="font-semibold text-slate-900">
                    {store.storeName}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Store ID: {store.storeId}
                  </p>

                  <p
                    className={`mt-4 text-sm font-semibold ${
                      isActive ? "text-green-600" : "text-amber-600"
                    }`}
                  >
                    {isActive ? "Active Plan" : "No Active Plan"}
                  </p>

                  {Number.isFinite(expiry) && (
                    <p className="mt-2 text-xs text-slate-500">
                      Expires on:{" "}
                      {new Date(expiry).toLocaleDateString("en-IN")}
                    </p>
                  )}

                  <button
                    onClick={() =>
                      router.push(
                        `/business-dashboard/plans?storeId=${encodeURIComponent(
                          store._id
                        )}`
                      )
                    }
                    className="mt-4 w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
                  >
                    {isActive ? "View Plans" : "Activate Plan"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
