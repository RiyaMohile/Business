"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store,
  Package,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
  const token = localStorage.getItem("token");

  if (token) {
    router.replace("/business-dashboard");
  }
}, [router]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-900 lg:h-screen lg:overflow-hidden">

      {/* ================= NAVBAR ================= */}
      <header className="absolute left-0 right-0 top-0 z-30 sm:bg-white/55 sm:backdrop-blur-md">
  <div className="mx-auto flex max-w-[1400px] items-center px-4 py-4 sm:px-5 sm:py-5 lg:px-6">

          {/* LOGO */}
          <Link href="/" className="hidden shrink-0 items-center sm:flex gap-2">
            <div className="relative h-9 w-9 sm:h-12 sm:w-12">
              <Image
                src="/icon.png"
                alt="Thover Business"
                fill
                className="object-contain rounded-[10px]"
                priority
              />
            </div>
            <span className="text-[24px] font-bold tracking-tight text-slate-900">
      Thover Business
    </span>
          </Link>

{/* ================= MOBILE NAVBAR ================= */}
<div className="flex w-full items-center justify-between sm:hidden">

  {/* LEFT - LOGO + NAME */}
  <Link href="/" className="flex items-center gap-2">
    <div className="relative h-9 w-9 shrink-0">
      <Image
        src="/icon.png"
        alt="Thover Business"
        fill
        className="rounded-[9px] object-contain"
        priority
      />
    </div>

    <span className="text-[20px] font-bold tracking-tight text-slate-900">
      Thover Business
    </span>
  </Link>

  {/* RIGHT - LOGIN */}
  <button
    onClick={() => router.push("/login")}
    className="rounded-lg border border-purple-800 px-4 py-2 text-xs cursor-pointer font-semibold text-purple-800 transition hover:bg-purple-600 hover:text-white hover:border-purple-600"
  >
    Login
  </button>

</div>

          {/* ================= DESKTOP NAVIGATION ================= */}
          <nav className="ml-auto hidden items-center gap-3 sm:flex sm:gap-4 lg:gap-6">

            <Link
              href="/business-dashboard/about/business-privacy-policy/"
              className="text-sm font-medium text-slate-600 transition hover:text-purple-600"
            >
              Privacy Policy
            </Link>

            <Link
              href="/business-dashboard/about/business-terms-of-use/"
              className="text-sm font-medium text-slate-600 transition hover:text-purple-600"
            >
              Terms of Use
            </Link>

            <Link
              href="/business-dashboard/about/return-refund-policy/"
              className="text-sm font-medium text-slate-600 transition hover:text-purple-600"
            >
              Business Policies
            </Link>

            <button
  onClick={() => router.push("/login")}
  className="cursor-pointer rounded-lg border border-purple-800 px-6 py-2 text-sm font-semibold text-purple-800 transition hover:bg-purple-600 hover:text-white hover:border-purple-600"
>
  Login
</button>

          </nav>

        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="relative min-h-screen overflow-hidden lg:h-screen">

        {/* =================================================
            DESKTOP IMAGE
            Desktop code/layout remains the same
        ================================================= */}
        <div className="absolute inset-y-0 right-0 hidden w-[68%] sm:w-[66%] lg:block lg:w-[85%]">

          <Image
            src="/store-owner.png"
            alt="Thover Business"
            fill
            priority
            className="object-cover object-center"
            sizes="65vw"
          />

          {/* Desktop white blend */}
          <div className="absolute inset-y-0 left-0 w-[35%] bg-gradient-to-r from-white via-white/90 to-transparent" />

        </div>


        {/* ================= HERO CONTENT ================= */}
        <div className="relative z-10 mx-auto flex max-w-[1400px] items-start px-4 pt-20 pb-0 sm:px-5 lg:h-screen lg:items-center lg:px-6 lg:pt-16 lg:pb-8">

          {/* LEFT CONTENT */}
          <div className="w-full max-w-[600px]">

            {/* HEADING */}
            <h1 className="text-[42px] font-bold leading-[1.02] tracking-[-0.04em] text-slate-950 sm:text-5xl md:text-6xl lg:text-[62px]">

              Take Your Business

              <span className="block bg-gradient-to-r from-purple-600 via-purple-500 to-emerald-500 bg-clip-text text-transparent">
                Online with Ease.
              </span>

            </h1>

            {/* DESCRIPTION */}
            <p className="mt-5 max-w-[560px] text-sm leading-6 text-slate-500 sm:text-base sm:leading-7 lg:text-lg">
              Create your online store, showcase products, manage
              inventory, and handle orders - all from one simple
              and powerful platform.
            </p>

            {/* ================= GET STARTED ================= */}
<div className="mt-6 flex gap-3 sm:hidden">

  <button
    onClick={() => router.push("/register")}
    className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:bg-purple-700 sm:flex-none sm:px-10 sm:py-3.5 sm:text-base"
  >
    Get Started

    <span className="text-base transition-transform group-hover:translate-x-1 sm:text-xl">
      →
    </span>
  </button>

</div>


            {/* =================================================
                DESKTOP GET STARTED
            ================================================= */}
            <div className="mt-7 hidden sm:block">

              <button
                onClick={() => router.push("/register")}
                className="group flex items-center gap-5 rounded-xl bg-purple-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:bg-purple-700 sm:px-10"
              >
                Get Started

                <span className="text-xl transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>

            </div>


            {/* ================= TRUST POINTS ================= */}
            <div className="mt-7 flex flex-wrap gap-x-4 gap-y-3 sm:gap-x-6">

              <div className="flex items-center gap-1.5 text-xs text-slate-600 sm:gap-2 sm:text-sm">
                <CheckCircle2
                  size={18}
                  className="shrink-0 text-emerald-500"
                />
                Easy to use
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-600 sm:gap-2 sm:text-sm">
                <CheckCircle2
                  size={18}
                  className="shrink-0 text-emerald-500"
                />
                Manage everything
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-600 sm:gap-2 sm:text-sm">
                <CheckCircle2
                  size={18}
                  className="shrink-0 text-emerald-500"
                />
                Grow faster
              </div>

            </div>


            {/* ================= FEATURES ================= */}
<div className="mt-8 hidden grid-cols-3 gap-4 sm:grid">

  {/* SET UP STORE */}
  <div className="rounded-xl border border-slate-100 bg-white/95 p-2.5 shadow-sm backdrop-blur-sm sm:rounded-2xl sm:p-4">

    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 sm:mb-3 sm:h-10 sm:w-10 sm:rounded-xl">
      <Store
        size={16}
        className="text-emerald-500 sm:h-5 sm:w-5"
      />
    </div>

    <h3 className="text-[11px] font-bold leading-tight sm:text-base">
      Set Up Store
    </h3>

    <p className="mt-1 text-[9px] leading-4 text-slate-400 sm:text-sm sm:leading-5">
      Get started in minutes
    </p>

  </div>


  {/* ADD PRODUCTS */}
  <div className="rounded-xl border border-slate-100 bg-white/95 p-2.5 shadow-sm backdrop-blur-sm sm:rounded-2xl sm:p-4">

    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 sm:mb-3 sm:h-10 sm:w-10 sm:rounded-xl">
      <Package
        size={16}
        className="text-blue-500 sm:h-5 sm:w-5"
      />
    </div>

    <h3 className="text-[11px] font-bold leading-tight sm:text-base">
      Add Products
    </h3>

    <p className="mt-1 text-[9px] leading-4 text-slate-400 sm:text-sm sm:leading-5">
      List products easily
    </p>

  </div>


  {/* MANAGE ORDERS */}
  <div className="rounded-xl border border-slate-100 bg-white/95 p-2.5 shadow-sm backdrop-blur-sm sm:rounded-2xl sm:p-4">

    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 sm:mb-3 sm:h-10 sm:w-10 sm:rounded-xl">
      <ClipboardList
        size={16}
        className="text-purple-500 sm:h-5 sm:w-5"
      />
    </div>

    <h3 className="text-[11px] font-bold leading-tight sm:text-base">
      Manage Orders
    </h3>

    <p className="mt-1 text-[9px] leading-4 text-slate-400 sm:text-sm sm:leading-5">
      Stay in control
    </p>

  </div>

</div>

          </div>
        </div>

<div className="relative mt-5 h-[350px] w-full lg:hidden">
  <Image
    src="/mobile-store.png"
    alt="Thover Business"
    fill
    priority
    className="object-cover object-[center_70%]"
    sizes="100vw"
  />
</div>


{/* ================= MOBILE FEATURES ================= */}
<div className="grid grid-cols-3 gap-2 px-4 pb-5 pt-3 sm:hidden">

  {/* STORE */}
  <div className="rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm">

    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
      <Store
        size={16}
        className="text-emerald-500"
      />
    </div>

    <h3 className="text-[10px] font-bold leading-tight text-slate-900">
      Set Up Store
    </h3>

    <p className="mt-1 text-[8px] leading-3 text-slate-400">
      Get started
    </p>

  </div>


  {/* PRODUCTS */}
  <div className="rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm">

    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
      <Package
        size={16}
        className="text-blue-500"
      />
    </div>

    <h3 className="text-[10px] font-bold leading-tight text-slate-900">
      Add Products
    </h3>

    <p className="mt-1 text-[8px] leading-3 text-slate-400">
      List products
    </p>

  </div>


  {/* ORDERS */}
  <div className="rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm">

    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
      <ClipboardList
        size={16}
        className="text-purple-500"
      />
    </div>

    <h3 className="text-[10px] font-bold leading-tight text-slate-900">
      Manage Orders
    </h3>

    <p className="mt-1 text-[8px] leading-3 text-slate-400">
      Stay in control
    </p>

  </div>

</div>
{/* ================= MOBILE LEGAL LINKS ================= */}
<div className="flex items-center justify-center gap-4 px-4 pb-8 pt-2 sm:hidden ">

  <Link
    href="/business-dashboard/about/business-privacy-policy/"
    className="text-[10px] text-purple-600 font-bold  transition hover:text-purple-600"
  >
    Privacy Policy
  </Link>

  <Link
    href="/business-dashboard/about/business-terms-of-use/"
    className="text-[10px] text-purple-600 font-bold  transition hover:text-purple-600"
  >
    Terms of Use
  </Link>

  <Link
    href="/business-dashboard/about/return-refund-policy/"
    className="text-[10px] text-purple-600 font-bold  transition hover:text-purple-600"
  >
    Business Policies
  </Link>

</div>

      </section>



    </main>
  );
}