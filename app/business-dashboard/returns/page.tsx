"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, Check, RefreshCw, RotateCcw } from "lucide-react";

import Navbar from "@/app/components/Navbar";
import DashboardSidebar from "@/app/components/DashboardSidebar";
import MobileDashboardNav from "@/app/components/dashboard/MobileDashboardNav";
import {
  getStoreReturnRequests,
  ReturnRequest,
  ReturnStatus,
} from "@/app/services/orderReturnApi";

const REFRESH_MS = 15000;

const badge: Record<ReturnStatus, { label: string; cls: string }> = {
  requested: { label: "Requested", cls: "bg-amber-50 text-amber-700" },
  completed: { label: "Completed", cls: "bg-emerald-50 text-emerald-700" },
  rejected: { label: "Rejected", cls: "bg-red-50 text-red-700" },
};

const formatTime = (raw: string) => {
  const d = new Date(raw);
  if (!raw || isNaN(d.getTime())) return raw || "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

function OtpBox({ otp }: { otp: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(otp);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="mt-3 rounded-xl border border-violet-200 bg-violet-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-2xl font-bold tracking-[0.3em] text-violet-700">
          {otp}
        </span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-700"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="mt-2 text-xs text-violet-700/80">
        Share this OTP with the customer when they bring the product.
      </p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="animate-pulse rounded-xl border border-slate-100 bg-white p-4">
          <div className="flex gap-3">
            <div className="h-16 w-16 rounded-lg bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-slate-200" />
              <div className="h-3 w-2/3 rounded bg-slate-200" />
              <div className="h-3 w-1/2 rounded bg-slate-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ReturnRequestsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const inFlight = useRef(false);

  const load = useCallback(async (silent = false) => {
    if (inFlight.current) return;
    inFlight.current = true;
    if (!silent) setLoading(true);
    try {
      setReturns(await getStoreReturnRequests());
      setError("");
    } catch (e: any) {
      // keep showing existing data on a failed background refresh
      if (!silent) {
        setError(e?.response?.data?.message || e?.message || "Failed to load return requests");
      }
    } finally {
      inFlight.current = false;
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") load(true);
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  return (
    <div className="min-h-screen bg-[#f8f8fc] px-3 pb-24 pt-20 sm:px-5 md:ml-[248px] md:w-[calc(100%-248px)] md:px-7 md:pb-10 md:pt-28">
      <Navbar />
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>
      <div className="md:hidden">
        <MobileDashboardNav />
      </div>

      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-start justify-between gap-3 px-1">
          <div>
            <h1 className="text-xl font-bold text-slate-900 md:text-3xl">Return Requests</h1>
            <p className="mt-1 text-xs text-slate-500 md:text-sm">
              Customers who asked to return an order. Updates every 15 seconds.
            </p>
          </div>
          <button
            type="button"
            onClick={() => load()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        <div className="mt-5">
          {loading ? (
            <Skeleton />
          ) : error ? (
            <div className="rounded-xl border border-red-100 bg-white p-6 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <button
                type="button"
                onClick={() => load()}
                className="mt-3 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
              >
                Retry
              </button>
            </div>
          ) : returns.length === 0 ? (
            <div className="rounded-xl border border-slate-100 bg-white p-10 text-center">
              <RotateCcw className="mx-auto text-slate-300" size={36} />
              <p className="mt-3 text-sm font-semibold text-slate-700">No return requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {returns.map((r) => (
                <div key={r.id} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex gap-3">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {r.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.image} alt={r.productTitle} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {r.productTitle}
                        </p>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge[r.status].cls}`}
                        >
                          {badge[r.status].label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {r.orderNumber ? `Order #${r.orderNumber}` : "Order"} · {r.customerName}
                      </p>
                      <div className="mt-1 flex flex-wrap justify-between gap-x-3 text-xs text-slate-500">
                        <span>Requested {formatTime(r.requestedAt)}</span>
                        {r.refundAmount !== null && (
                          <span className="font-semibold text-slate-800">
                            Refund ₹{r.refundAmount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {r.status === "requested" && r.otp && <OtpBox otp={r.otp} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
