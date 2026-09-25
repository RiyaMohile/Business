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

export default function DashboardSidebar() {
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

        if (
          !response?.success ||
          !Array.isArray(response?.stores)
        ) {
          setIsManager(false);
          return;
        }

        // Selected store find karo
        const selectedStore = response.stores.find(
          (store: any) =>
            store._id === selectedStoreId
        );

        if (!selectedStore) {
          setIsManager(false);
          return;
        }

        // Current user ka selected store mein member record
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

        const manager =
          member?.role === "manager";

        setIsManager(manager);

        console.log("SIDEBAR ROLE CHECK:", {
          selectedStoreId,
          userId: user?._id,
          member,
          role: member?.role,
          isManager: manager,
        });
      } catch (error) {
        console.error(
          "SIDEBAR ROLE CHECK ERROR:",
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
    <aside
      className="
        fixed
        left-0
        top-20
        z-40
        hidden
        h-[calc(100dvh-80px)]
        w-[248px]
        border-r
        border-slate-200
        bg-white
        md:block
      "
    >
      <div className="flex h-full flex-col px-5 py-6">
        <nav className="flex flex-col gap-2">
          {items.map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.path ||
              (item.path !== "/business-dashboard" &&
                pathname.startsWith(
                  `${item.path}/`
                ));

            return (
              <button
                key={item.label}
                type="button"
                onClick={() =>
                  router.push(item.path)
                }
                className={`
                  flex
                  w-full
                  items-center
                  gap-4
                  rounded-xl
                  px-4
                  py-3.5
                  text-left
                  transition-all
                  ${
                    isActive
                      ? "bg-violet-50 text-violet-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }
                `}
              >
                <Icon
                  size={21}
                  strokeWidth={
                    isActive ? 2.2 : 1.8
                  }
                  className={
                    isActive
                      ? "text-violet-600"
                      : "text-slate-600"
                  }
                />

                <span className="text-sm font-semibold">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}