"use client";

import {
  Home,
  Package,
  ShoppingBag,
  ReceiptText,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMyStores } from "@/app/services/storeApi";

export default function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [isManager, setIsManager] = useState(false);
  const [hasStore, setHasStore] = useState<boolean | null>(null);

  useEffect(() => {
    const checkStoreAndRole = async () => {
      try {
        const selectedStoreId =
          localStorage.getItem("selectedStoreId");

        const userData =
          localStorage.getItem("user");

        if (!userData) {
          setHasStore(false);
          setIsManager(false);
          return;
        }

        const user = JSON.parse(userData);

        const response = await getMyStores();

        // API response check
        if (
          !response?.success ||
          !Array.isArray(response?.stores)
        ) {
          setHasStore(false);
          setIsManager(false);
          return;
        }

        // =====================================
        // CHECK USER HAS ANY STORE OR NOT
        // =====================================

        const stores = response.stores;

        if (stores.length === 0) {
          // User ke paas koi store nahi hai
          setHasStore(false);
          setIsManager(false);

          console.log("SIDEBAR: User has NO store");

          return;
        }

        // User ke paas kam se kam 1 store hai
        setHasStore(true);

        console.log("SIDEBAR: User has store", stores);

        // =====================================
        // CHECK MANAGER ROLE
        // =====================================

        if (!selectedStoreId) {
          setIsManager(false);
          return;
        }

        const selectedStore = stores.find(
          (store: any) =>
            store._id?.toString() ===
            selectedStoreId?.toString()
        );

        if (!selectedStore) {
          setIsManager(false);
          return;
        }

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
          selectedStore,
          member,
          role: member?.role,
          isManager: manager,
        });

      } catch (error) {
        console.error(
          "SIDEBAR CHECK ERROR:",
          error
        );

        setHasStore(false);
        setIsManager(false);
      }
    };

    checkStoreAndRole();

    const handleStoreChanged = () => {
      checkStoreAndRole();
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

  // =====================================
  // NO STORE → NO SIDEBAR
  // =====================================

  if (hasStore !== true) {
    return null;
  }

  // =====================================
  // HAS STORE → SHOW SIDEBAR
  // =====================================

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