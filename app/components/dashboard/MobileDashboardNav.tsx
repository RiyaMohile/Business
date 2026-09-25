"use client";

import {
  Home,
  Package,
  ShoppingBag,
  Wallet,
  ReceiptText,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMyStores } from "@/app/services/storeApi";

export default function MobileDashboardNav() {
  const router = useRouter();
  const pathname = usePathname();

  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    const checkManager = async () => {
      try {
        const selectedStoreId =
          localStorage.getItem("selectedStoreId");

        const userData =
          localStorage.getItem("user");

        if (!selectedStoreId || !userData) {
          setIsManager(false);
          return;
        }

        const user = JSON.parse(userData);

        const response = await getMyStores();

        const stores =
          response?.stores ||
          response?.data?.stores ||
          response?.data ||
          [];

        if (!Array.isArray(stores)) {
          setIsManager(false);
          return;
        }

        // Selected store find karo
        const selectedStore = stores.find(
          (store: any) =>
            store._id === selectedStoreId
        );

        if (!selectedStore) {
          setIsManager(false);
          return;
        }

        // Selected store ke andar logged-in user find karo
        const member = selectedStore.users?.find(
          (item: any) => {
            const memberUserId =
              typeof item.userId === "object"
                ? item.userId?._id
                : item.userId;

            return (
              memberUserId?.toString() ===
                user?._id?.toString() &&
              item.status === "active"
            );
          }
        );

        setIsManager(
          member?.role === "manager"
        );

      } catch (error) {
        console.error(
          "MOBILE NAV ROLE CHECK ERROR:",
          error
        );

        setIsManager(false);
      }
    };

    checkManager();

    // Store change hone par role dobara check karo
    const handleStoreChanged = () => {
      checkManager();
    };

    window.addEventListener(
      "selectedStoreChanged",
      handleStoreChanged
    );

    return () => {
      window.removeEventListener(
        "selectedStoreChanged",
        handleStoreChanged
      );
    };
  }, []);

  const items = [
    {
      label: "Dashboard",
      icon: Home,
      path: "/business-dashboard",
    },
    {
      label: "Products",
      icon: Package,
      path: "/business-dashboard/product",
    },
    {
      label: "Orders",
      icon: ShoppingBag,
      path: "/business-dashboard/order",
    },
    {
  label: "Bill",
  icon: ReceiptText,
  path: "/business-dashboard/bill",
},
  ];

  return (
    <nav
      className="
        fixed
        inset-x-0
        bottom-0
        z-[9999]
        block
        w-full
        border-t
        border-slate-200
        bg-white
        shadow-[0_-2px_10px_rgba(0,0,0,0.08)]
      "
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex h-[64px] items-center justify-between px-3">
        {items.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.path;

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => router.push(item.path)}
              className={`
                flex
                min-w-0
                flex-1
                flex-col
                items-center
                justify-center
                gap-1
                rounded-xl
                py-1.5
                text-[10px]
                font-medium
                ${
                  isActive
                    ? "text-blue-600"
                    : "text-slate-500"
                }
              `}
            >
              <Icon
                size={19}
                strokeWidth={1.8}
              />

              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}