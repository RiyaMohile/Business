"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Shield,
  Wallet,
  FileText,
  MessageCircle,
  AlertTriangle,
  Landmark,
  Users,
  ShieldCheck,
  FolderTree,
  BarChart3,
  Menu,
  X,
} from "lucide-react";

const menus = [
  // {
  //   title: "Dashboard",
  //   href: "/dashboard",
  //   icon: LayoutDashboard,
  // },
  {
    title: "Admins",
    href: "/admins",
    icon: Shield,
  },
  {
    title: "Wallets",
    href: "/wallets",
    icon: Wallet,
  },
  {
    title: "Posts",
    href: "/posts",
    icon: FileText,
  },
  {
    title: "Vibes",
    href: "/vibes",
    icon: MessageCircle,
  },
  {
    title: "Verifications",
    href: "/verifications",
    icon: ShieldCheck,
  },
  {
    title: "Categories",
    href: "/categories",
    icon: FolderTree,
  },
  // {
  //   title: "Reports",
  //   href: "/reports",
  //   icon: AlertTriangle,
  // },
  {
    title: "Withdrawals",
    href: "/withdrawals",
    icon: Landmark,
  },
  {
    title: "Store Reports",
    icon: BarChart3,
    href: "/reports/store-onboarding",
  },
  {
    title: "Pages",
    href: "/about",
    icon: FileText,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ================= MOBILE TOP BAR ================= */}
      <div className="fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm md:hidden">
        <div className="text-xl font-bold text-blue-700">
          Thover Admin
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="rounded-lg p-2 text-gray-700 hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {mobileOpen && (
        <div className="fixed left-0 top-16 z-40 w-full border-b border-gray-200 bg-white shadow-lg md:hidden">
          <nav className="max-h-[calc(100vh-4rem)] overflow-y-auto py-2">
            {menus.map((menu) => {
              const Icon = menu.icon;

              return (
                <Link
                  key={menu.href}
                  href={menu.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-6 py-4 transition ${
                    pathname === menu.href
                      ? "bg-blue-700 text-white"
                      : "text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  <Icon size={20} />
                  {menu.title}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="fixed left-0 top-0 hidden h-screen w-72 overflow-y-auto bg-white shadow-lg md:block">

        <div className="border-b border-gray-200 p-6 text-3xl font-bold text-blue-700">
          Thover Admin
        </div>

        <nav className="mt-6">
          {menus.map((menu) => {
            const Icon = menu.icon;

            return (
              <Link
                key={menu.href}
                href={menu.href}
                className={`flex items-center gap-3 px-6 py-4 transition ${
                  pathname === menu.href
                    ? "bg-blue-700 text-white"
                    : "text-gray-700 hover:bg-blue-50"
                }`}
              >
                <Icon size={20} />
                {menu.title}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}