
"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Bike,
  Search,
  RefreshCw,
  Users,
  MapPin,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Wifi,
  WifiOff,
  AlertCircle,
  Eye
} from "lucide-react";
import { useRouter } from "next/navigation";

interface RiderAddress {
  name?: string;
  area?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
}

interface Rider {
  _id: string;
  riderId?: string;
  userId?: {
     _id?: string;
    name?: string;
    username?: string;
    email?: string;
    phoneNumber?: string;
  } | string;
  isOnline: boolean;
  vehicleType: string;
  vehicleName: string;
  vehicleNumber: string;
  createdAt: string;
  addresses?: RiderAddress[];
}

interface RiderResponse {
  success: boolean;
  totalRiders: number;
  currentPage: number;
  totalPages: number;
  riders: Rider[];
}



const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.thover.in";

// Change this path if your router is mounted elsewhere.
const REPORT_URL = `${API_URL}/v1/api/rider/admin/report`;

const initialFilters = {
  startDate: "",
  endDate: "",
  city: "",
  state: "",
  area: "",
  country: "",
  pinCode: "",
};

type Filters = typeof initialFilters;

export default function RiderManagementPage() {
  const router = useRouter();
  const [riders, setRiders] = useState<Rider[]>([]);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalRiders, setTotalRiders] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRiders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params: Record<string, string | number> = {
        page,
        limit: 20,
      };

      Object.entries(filters).forEach(([key, value]) => {
        if (value.trim()) {
          params[key] = value.trim();
        }
      });

      // Update the token key if your app stores it under
      // a different name. If protect uses cookies, configure
      // your axios instance accordingly instead.
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      const { data } = await axios.get<RiderResponse>(
        REPORT_URL,
        {
          params,
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      );

      setRiders(data.riders || []);
      setTotalRiders(data.totalRiders || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Unable to fetch rider report."
        );
      } else {
        setError("Something went wrong while loading riders.");
      }

      setRiders([]);
      setTotalRiders(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchRiders();
  }, [fetchRiders]);

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setSearch("");
    setPage(1);
  };

  const filteredRiders = riders.filter((rider) => {
    const address = rider.addresses?.[0];
    const user =
      typeof rider.userId === "object" && rider.userId
        ? rider.userId
        : undefined;

    const searchable = [
      rider.riderId,
      user?.name,
      user?.username,
      user?.email,
      user?.phoneNumber,
      rider.vehicleName,
      rider.vehicleNumber,
      address?.city,
      address?.area,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchable.includes(search.toLowerCase());
  });

  const onlineCount = riders.filter((rider) => rider.isOnline).length;
  const offlineCount = riders.length - onlineCount;

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <Bike size={16} />
              <span>Management</span>
              <ChevronRight size={14} />
              <span className="text-emerald-700">Riders</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
              Rider Management
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Monitor rider details, vehicle information and availability.
            </p>
          </div>

          <button
            onClick={fetchRiders}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Total Riders"
            value={totalRiders}
            icon={<Users size={21} />}
            color="blue"
          />
          <SummaryCard
            title="Online on Current Page"
            value={onlineCount}
            icon={<Wifi size={21} />}
            color="green"
          />
          <SummaryCard
            title="Offline on Current Page"
            value={offlineCount}
            icon={<WifiOff size={21} />}
            color="orange"
          />
        </div>

        {/* FILTERS */}
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <MapPin size={19} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                Filter Riders
              </h2>
              <p className="text-xs text-gray-500">
                Filter by location and registration date.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FilterField label="Start Date">
              <input
                type="date"
                value={filters.startDate}
                max={filters.endDate || undefined}
                onChange={(e) =>
                  updateFilter("startDate", e.target.value)
                }
                className={inputClass}
              />
            </FilterField>

            <FilterField label="End Date">
              <input
                type="date"
                value={filters.endDate}
                min={filters.startDate || undefined}
                onChange={(e) =>
                  updateFilter("endDate", e.target.value)
                }
                className={inputClass}
              />
            </FilterField>

            <FilterField label="City">
              <input
                value={filters.city}
                placeholder="e.g. Gwalior"
                onChange={(e) => updateFilter("city", e.target.value)}
                className={inputClass}
              />
            </FilterField>

            <FilterField label="State">
              <input
                value={filters.state}
                placeholder="e.g. Madhya Pradesh"
                onChange={(e) => updateFilter("state", e.target.value)}
                className={inputClass}
              />
            </FilterField>

            <FilterField label="Area">
              <input
                value={filters.area}
                placeholder="Enter area"
                onChange={(e) => updateFilter("area", e.target.value)}
                className={inputClass}
              />
            </FilterField>

            <FilterField label="Country">
              <input
                value={filters.country}
                placeholder="e.g. India"
                onChange={(e) =>
                  updateFilter("country", e.target.value)
                }
                className={inputClass}
              />
            </FilterField>

            <FilterField label="PIN Code">
              <input
                value={filters.pinCode}
                placeholder="Enter PIN code"
                onChange={(e) =>
                  updateFilter("pinCode", e.target.value)
                }
                className={inputClass}
              />
            </FilterField>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => {
                setPage(1);
                fetchRiders();
              }}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              <Search size={16} />
              Apply Filters
            </button>

            <button
              onClick={resetFilters}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Reset Filters
            </button>
          </div>
        </section>

        {/* RIDERS TABLE */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-100 p-4 md:flex-row md:items-center md:justify-between md:p-6">
            <div>
              <h2 className="font-semibold text-gray-900">
                Rider Directory
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {totalRiders} rider(s) found
              </p>
            </div>

            <div className="relative w-full md:max-w-xs">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search current page..."
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          {error && (
            <div className="m-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Could not load riders</p>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-gray-500">
              <RefreshCw size={25} className="animate-spin text-emerald-600" />
              <p className="text-sm">Loading riders...</p>
            </div>
          ) : !error && filteredRiders.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                <Bike size={28} />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">
                No riders found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try changing the filters or search term.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Rider</th>
                      <th className="px-5 py-4 font-semibold">Vehicle</th>
                      <th className="px-5 py-4 font-semibold">Location</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 font-semibold">Registered</th>
                      <th className="px-5 py-4 font-semibold">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredRiders.map((rider) => {
                      const address = rider.addresses?.[0];
                      const user =
                        typeof rider.userId === "object" && rider.userId
                          ? rider.userId
                          : undefined;

                      return (
                        <tr
                          key={rider._id}
                          className="transition hover:bg-gray-50/80"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                <Bike size={19} />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {user?.name || user?.username || "Rider"}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  {rider.riderId || "No Rider ID"}
                                </p>
                                {user?.phoneNumber && (
                                  <p className="mt-1 text-xs text-gray-500">
                                    {user.phoneNumber}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-medium text-gray-800">
                              {rider.vehicleName}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {rider.vehicleType}
                            </p>
                            <span className="mt-2 inline-block rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                              {rider.vehicleNumber}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            {address ? (
                              <>
                                <p className="font-medium text-gray-800">
                                  {address.area || "—"}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  {[address.city, address.state]
                                    .filter(Boolean)
                                    .join(", ") || "—"}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  {[address.country, address.pinCode]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </p>
                              </>
                            ) : (
                              <span className="text-gray-400">
                                No address
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {rider.isOnline ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Online
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                                Offline
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4 text-gray-600">
                            <span className="inline-flex items-center gap-2">
                              <CalendarDays size={15} className="text-gray-400" />
                              {rider.createdAt
                                ? new Date(rider.createdAt).toLocaleDateString()
                                : "—"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
  <button
    type="button"
    onClick={() => {
      const userId =
        typeof rider.userId === "object" && rider.userId
          ? rider.userId._id
          : rider.userId;

      if (!userId) {
        alert("User ID not available for this rider");
        return;
      }

      router.push(`/admins/users/view/rider?id=${userId}`);
    }}
    className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
  >
    <Eye size={15} />
    View Details
  </button>
</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
                <p className="text-sm text-gray-500">
                  Page {page} of {Math.max(1, totalPages)}
                  {" · "}Showing {filteredRiders.length} rider(s) on this page
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                    disabled={page <= 1 || loading}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  <button
                    onClick={() =>
                      setPage((previous) =>
                        Math.min(Math.max(1, totalPages), previous + 1)
                      )
                    }
                    disabled={page >= totalPages || loading || totalPages === 0}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "green" | "orange";
}) {
  const styles = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    orange: "bg-orange-50 text-orange-700",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[color]}`}>
          {icon}
        </div>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
