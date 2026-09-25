"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Package,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getStoreProducts } from "../../services/productApi";
import {
  updateStoreOnlineStatus,
  getMyStores,
} from "../../services/storeApi";
import MobileDashboardNav from "@/app/components/dashboard/MobileDashboardNav";
import Navbar from "@/app/components/Navbar";
import DashboardSidebar from "@/app/components/DashboardSidebar";
import ProductActionModal from "@/app/components/stores/post/ProductActionModal";
import UpdateDiscountModal from "@/app/components/stores/post/UpdateDiscountModal";
import UpdateInventoryModal from "@/app/components/stores/post/UpdateInventoryModal";
import ArchiveProductModal from "@/app/components/stores/post/ArchiveProductModal";
import DeleteProductModal from "@/app/components/stores/post/DeleteProductModal";
import EditPostModal from "@/app/components/stores/post/EditPostModal";
import ManageMediaModal from "@/app/components/stores/post/ManageMediaModal";

// =====================================================
// TYPES
// =====================================================

interface User {
  _id: string;
  name?: string;
  email?: string;
}

interface Product {
  _id: string;
  postId: string;
  topic: string;
  description?: string;
  category?: string;
  status?: string;

  isArchived?: boolean;

  media?: {
    mediaUrl?: string;
    mediaName?: string;
    mediaPath?: string;
    isDeleted?: boolean;
  }[];

  price?: {
    currency?: string;
    amount?: number;
    priceType?: string;
  };
  discount?: {
  title?: string;
  expiry?: string;
  type?: "percentage" | "flat";
  value?: number;
};

  inventory?: {
    size: string;
    stock: number;
  }[];

  totalStock?: number;
}

// =====================================================
// MAIN PRODUCTS PAGE
// =====================================================

export default function ProductsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  const [posts, setPosts] = useState<Product[]>([]);

  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedProduct, setSelectedProduct] =
  useState<any | null>(null);

const [discountProduct, setDiscountProduct] =
  useState<Product | null>(null);

  const [search, setSearch] = useState("");
  const [isOnline, setIsOnline] = useState(false);
const [updatingStatus, setUpdatingStatus] = useState(false);

const [selectedStoreRole, setSelectedStoreRole] = useState<
  "owner" | "manager" | "employee" | null
>(null);

const [showInventoryModal, setShowInventoryModal] =
  useState(false);
  const [inventoryProduct, setInventoryProduct] =
  useState<Product | null>(null);
  const [archiveProduct, setArchiveProduct] =
  useState<Product | null>(null);

  const [activeTab, setActiveTab] = useState<"Active" | "Archived">("Active");
  const [currentPage, setCurrentPage] = useState(1);
const productsPerPage = 5;
  const [showDeleteModal, setShowDeleteModal] =
  useState(false);
  const [showActionModal, setShowActionModal] =
  useState(false);

  const [editingPost, setEditingPost] =
  useState<Product | null>(null);

  const [manageMediaProduct, setManageMediaProduct] =
  useState<Product | null>(null);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

//   useEffect(() => {
//     initializeProductsPage();
//   }, []);
//   useEffect(() => {
//   if (user?._id) {
//     fetchProducts(user._id);
//   }
// }, [user?._id]);

// const fetchProducts = async () => {
//   const storeId =
//     localStorage.getItem("selectedStoreId");

//   if (!storeId) {
//     setPosts([]);
//     setLoadingPosts(false);
//     return;
//   }

//   try {
//     setLoadingPosts(true);

//     const data = await getStoreProducts(
//       storeId
//     );

//     if (
//       data?.success &&
//       Array.isArray(data?.data?.posts)
//     ) {
//       setPosts(data.data.posts);
//     } else {
//       setPosts([]);
//     }
//   } catch (error: any) {
//     console.error(
//       "FETCH PRODUCTS ERROR:",
//       error.response?.data || error.message
//     );

//     setPosts([]);
//   } finally {
//     setLoadingPosts(false);
//   }
// };


useEffect(() => {
  fetchCurrentUser();
}, []);

useEffect(() => {
  if (user?._id) {
    fetchProducts();
    fetchSelectedStoreStatus();
  }
}, [user?._id]);
  // const initializeProductsPage = async () => {
  //   const currentUser = await fetchCurrentUser();

  //   if (currentUser?._id) {
  //     await fetchProducts(currentUser._id);
  //   } else {
  //     setPosts([]);
  //     setLoadingPosts(false);
  //   }
  // };

  // =====================================================
  // GET CURRENT USER
  // =====================================================

  const fetchCurrentUser = async (): Promise<User | null> => {
    try {
      setLoadingUser(true);

      const token = localStorage.getItem("token");

      if (!token) {
        console.error("Token not found");
        return null;
      }

      const { data } = await axios.get(
        "https://api.thover.in/v1/api/auth/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("PRODUCT PAGE USER:", data);

      if (data?.success && data?.user?._id) {
        setUser(data.user);

        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        return data.user;
      }

      return null;
    } catch (error: any) {
      console.error(
        "FETCH USER ERROR:",
        error.response?.data || error.message
      );

      return null;
    } finally {
      setLoadingUser(false);
    }
  };

  // =====================================================
  // GET POSTS
  // =====================================================

const fetchProducts = async () => {
  try {
    setLoadingPosts(true);

    // Selected store ka MongoDB _id
    const selectedStoreId =
      localStorage.getItem("selectedStoreId");

    console.log(
      "PRODUCTS - SELECTED STORE ID:",
      selectedStoreId
    );

    if (!selectedStoreId) {
      console.log("No selected store found");
      setPosts([]);
      return;
    }

    // ==========================================
    // GET PRODUCTS OF SELECTED STORE
    // Owner + Manager dono ke liye
    // ==========================================

    const data = await getStoreProducts(selectedStoreId);
    console.log("PRODUCT DATA:", data);

    console.log(
      "STORE PRODUCTS RESPONSE:",
      data
    );

    if (
      data?.success &&
      Array.isArray(data?.data?.posts)
    ) {
      setPosts(data.data.posts);
    } else if (
      data?.success &&
      Array.isArray(data?.posts)
    ) {
      setPosts(data.posts);
    } else {
      setPosts([]);
    }

  } catch (error: any) {
    console.error(
      "FETCH STORE PRODUCTS ERROR:",
      error.response?.data ||
        error.message ||
        error
    );

    setPosts([]);
  } finally {
    setLoadingPosts(false);
  }
};
// =====================================================
// GET SELECTED STORE ONLINE STATUS
// =====================================================

const fetchSelectedStoreStatus = async () => {
  try {
    const selectedStoreId =
      localStorage.getItem("selectedStoreId");

    if (!selectedStoreId) {
      setIsOnline(false);
      return;
    }

    const data = await getMyStores();

    if (
      !data?.success ||
      !Array.isArray(data?.stores)
    ) {
      setIsOnline(false);
      return;
    }

    const selectedStore = data.stores.find(
  (store: any) =>
    String(store._id) === String(selectedStoreId)
);

setIsOnline(selectedStore?.isOnline ?? false);

const loggedInUserId = String(user?._id);

if (String(selectedStore?.userId?._id || selectedStore?.userId) === loggedInUserId) {
  // Store owner
  setSelectedStoreRole("owner");
} else {
  const member = selectedStore?.users?.find(
    (item: any) =>
      String(item.userId?._id || item.userId) === loggedInUserId &&
      item.status === "active"
  );

  setSelectedStoreRole(member?.role ?? null);
}

  } catch (error: any) {
    console.error(
      "FETCH STORE ONLINE STATUS ERROR:",
      error.response?.data || error.message
    );

    setIsOnline(false);
  }
};

// =====================================================
// UPDATE STORE ONLINE STATUS
// =====================================================

const handleOnlineStatusChange = async (
  nextStatus: boolean
) => {
  const selectedStoreId =
    localStorage.getItem("selectedStoreId");

  if (!selectedStoreId) {
    alert("Store not found");
    return;
  }

  try {
    setUpdatingStatus(true);

    const response = await updateStoreOnlineStatus(
      selectedStoreId,
      nextStatus
    );

    console.log(
      "ONLINE STATUS RESPONSE:",
      response
    );

    if (response?.success) {
      setIsOnline(nextStatus);
    } else {
      alert(
        response?.message ||
          "Unable to update store status"
      );
    }

  } catch (error: any) {
    console.error(
      "UPDATE ONLINE STATUS ERROR:",
      error.response?.data || error.message
    );

    alert(
      error.response?.data?.message ||
        "Unable to update store status"
    );

  } finally {
    setUpdatingStatus(false);
  }
};

useEffect(() => {
  const handleStoreChange = () => {
    if (user?._id) {
      fetchProducts();
      fetchSelectedStoreStatus();
    }
  };

  window.addEventListener(
    "selectedStoreChanged",
    handleStoreChange
  );

  return () => {
    window.removeEventListener(
      "selectedStoreChanged",
      handleStoreChange
    );
  };
}, [user?._id]);

  // =====================================================
  // SEARCH + STATUS FILTER
  // =====================================================

  const filteredProducts = useMemo(() => {
  return posts.filter((post) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      !searchText ||
      post.topic?.toLowerCase().includes(searchText) ||
      post.category?.toLowerCase().includes(searchText);

    if (!matchesSearch) {
      return false;
    }

    if (activeTab === "Active") {
      return !post.isArchived;
    }

    if (activeTab === "Archived") {
      return post.isArchived === true;
    }

    return true;
  });
}, [posts, search, activeTab]);

const totalProducts = filteredProducts.length;

const totalPages = Math.max(
  1,
  Math.ceil(totalProducts / productsPerPage)
);

const paginatedProducts = filteredProducts.slice(
  (currentPage - 1) * productsPerPage,
  currentPage * productsPerPage
);

const startProduct =
  totalProducts === 0
    ? 0
    : (currentPage - 1) * productsPerPage + 1;

const endProduct = Math.min(
  currentPage * productsPerPage,
  totalProducts
);



const handleOpenActions = (product: Product) => {
  setSelectedProduct(product);
  setShowActionModal(true);
};

  // =====================================================
  // LOADING USER
  // =====================================================

  if (loadingUser) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading...
        </p>
      </main>
    );
  }

  // =====================================================
  // UI
  // =====================================================

 return (
  <div className="min-h-[100dvh] bg-slate-50">

    {/* =========================
        DESKTOP / COMMON NAVBAR
    ========================== */}

    <Navbar
  onAccountModalChange={() => {}}
  isOnline={isOnline}
  onOnlineStatusChange={handleOnlineStatusChange}
  updatingStatus={updatingStatus}
/>

    {/* =========================
        DESKTOP SIDEBAR
    ========================== */}

    <div className="hidden md:block">
      <DashboardSidebar />
    </div>

    {/* =========================
        MAIN CONTENT
    ========================== */}

    <main
  className="
    min-h-[100dvh]
    bg-slate-50
    px-3
    pb-24
    pt-20

    md:ml-[248px]
    md:min-h-[calc(100dvh-80px)]
    md:w-[calc(100%-248px)]
    md:px-10
    md:pb-10
    md:pt-28
  "
>

      {/* =========================
          MOBILE NAVIGATION
      ========================== */}

      {!(
        selectedProduct ||
        discountProduct ||
        inventoryProduct ||
        archiveProduct ||
        editingPost ||
        manageMediaProduct ||
        showDeleteModal
      ) && (
        <div className="md:hidden">
          <MobileDashboardNav />
        </div>
      )}

      {/* =========================
          PRODUCT CONTENT
      ========================== */}

      <div className="mx-auto w-full max-w-2xl md:max-w-none">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mt-4 flex items-center justify-between gap-4">
  <div>
    <h1 className="text-2xl font-bold text-slate-900">
      Products
    </h1>

    <p className="mt-1 text-[12px] text-slate-500">
      Manage your products and inventory.
    </p>
  </div>

  {/* ADD PRODUCT - ONLY WHEN PRODUCTS EXIST */}
  {posts.length > 0 && selectedStoreRole === "owner" && (
  <div
    className="
      flex
      w-full
      flex-row
      items-center
      gap-2
      sm:w-auto
      sm:justify-end
    "
  >
    {/* Add Product */}
    <button
      type="button"
      onClick={() =>
        router.push("/business-dashboard/product/create")
      }
      className="
        flex-1
        rounded-xl
        bg-blue-600
        px-1
        py-2
         text-[14px]
        font-semibold
        text-white
        shadow-sm
        transition
        hover:bg-blue-700
        active:scale-[0.98]
        sm:flex-none
        sm:px-4
      "
    >
      <span className="mr-1 text-base">+</span>
      Add Product
    </button>

    {/* Add Products */}
    <button
      type="button"
      onClick={() =>
        router.push("/business-dashboard/product/bulk-upload")
      }
      className="
        flex-1
        rounded-xl
        border
        border-blue-600
        bg-white
        px-
        py-2
        text-[13px]
        font-semibold
        text-blue-600
        shadow-sm
        transition
        hover:bg-blue-50
        active:scale-[0.98]
        sm:flex-none
        sm:px-4
      "
    >
      <span className="mr-1 text-base">+</span>Add Products
    </button>
  </div>
)}
</div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="relative mt-5 hidden md:block">
          <Search
            size={17}
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-slate-500
            "
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search products"
            className="
              h-12
              w-full
              rounded-xl
              border
              border-slate-200
              bg-white
              pl-10
              pr-4
              text-sm
              text-slate-800
              outline-none
              placeholder:text-slate-400
              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-100
            "
          />
        </div>

        {/* =================================================
            FILTER TABS
        ================================================= */}

        <div className="mt-3 flex items-center gap-2">
          {(
            [ "Active", "Archived"] as const
          ).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() =>{
                setActiveTab(tab)
                 setCurrentPage(1);
              }}
              className={`
                rounded-lg
                border
                px-4
                py-2
                text-xs
                font-semibold
                transition
                ${
                  activeTab === tab
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-700"
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* =================================================
    PRODUCTS
================================================= */}

<div
  className="
    mt-4
    overflow-hidden
    rounded-2xl
    border
    border-slate-200
    bg-white
  "
>
  {loadingPosts ? (
    <div className="px-5 py-12 text-center">
      <p className="text-sm text-slate-500">
        Loading products...
      </p>
    </div>
  ) : filteredProducts.length === 0 ? (
    <div className="flex min-h-[240px] flex-col items-center justify-center px-5 py-12 text-center">
      <div
        className="
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-slate-100
        "
      >
        <Package
          size={27}
          className="text-slate-400"
        />
      </div>

      <p className="mt-3 text-sm font-medium text-slate-700">
        No products found
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {posts.length === 0
          ? "Start adding products to your store."
          : "Try changing your search or filter."}
      </p>

      {posts.length === 0 && selectedStoreRole === "owner" && (
        <button
          type="button"
          onClick={() =>
            router.push(
              "/business-dashboard/product/create"
            )
          }
          className="
            mt-5
            rounded-xl
            bg-blue-600
            px-6
            py-2.5
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition
            hover:bg-blue-700
          "
        >
          <span className="mr-1 text-base">+</span>
          Add Product
        </button>
      )}
    </div>
  ) : (
    <>
      {/* =================================================
          MOBILE
          DO NOT CHANGE THE DESIGN
      ================================================= */}

      <div className="md:hidden">
        {filteredProducts.map((post, index) => {
          const image = post.media?.find(
            (media) =>
              !media.isDeleted &&
              media.mediaUrl
          )?.mediaUrl;

          return (
            <div
              key={post._id}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenActions(post);
              }}
              className={`
                flex
                items-center
                gap-3
                px-3
                py-3
                ${
                  index !== filteredProducts.length - 1
                    ? "border-b border-slate-100"
                    : ""
                }
              `}
            >
              {/* IMAGE */}

              <div
                className="
                  h-[62px]
                  w-[52px]
                  shrink-0
                  overflow-hidden
                  rounded-lg
                  bg-slate-100
                "
              >
                {image ? (
                  <img
                    src={image}
                    alt={post.topic}
                    className="
                      h-full
                      w-full
                      object-cover
                    "
                  />
                ) : (
                  <div
                    className="
                      flex
                      h-full
                      w-full
                      items-center
                      justify-center
                      bg-slate-100
                    "
                  >
                    <Package
                      size={24}
                      className="text-gray-400"
                    />
                  </div>
                )}
              </div>

              {/* PRODUCT DETAILS */}

              <div className="min-w-0 flex-1">
                <h3
                  className="
                    truncate
                    text-sm
                    font-bold
                    text-slate-900
                  "
                >
                  {post.topic}
                </h3>

                <p
                  className="
                    mt-0.5
                    text-sm
                    font-semibold
                    text-slate-900
                  "
                >
                  {post.price?.currency || "₹"}
                  {post.price?.amount ?? 0}
                </p>

                <div
                  className="
                    mt-0.5
                    flex
                    items-center
                    gap-1.5
                    text-[11px]
                    text-slate-500
                  "
                >
                  <span>
                    {post.category || "Other"}
                  </span>

                  <span>•</span>

                  <span>
                    Stock: {post.totalStock ?? 0}
                  </span>
                </div>
              </div>

              {/* STATUS */}

              <span
                className={`
                  shrink-0
                  rounded-md
                  px-2
                  py-1
                  text-[10px]
                  font-semibold
                  ${
                    post.status?.toLowerCase() ===
                    "archived"
                      ? "bg-slate-100 text-slate-500"
                      : "bg-green-50 text-green-600"
                  }
                `}
              >
                {post.status?.toLowerCase() ===
                "archived"
                  ? "Archived"
                  : "Public"}
              </span>
            </div>
          );
        })}
      </div>

      {/* =================================================
          DESKTOP TABLE ONLY
      ================================================= */}

      <div className="hidden md:block">

        {/* TABLE HEADER */}

        <div
          className="
            grid
            grid-cols-[minmax(200px,2fr)_minmax(100px,1fr)_100px_80px_100px_70px]
            items-center
            gap-4
            border-b
            border-slate-200
            bg-slate-50/70
            px-5
            py-4
            text-sm
            font-semibold
            text-slate-600
          "
        >

          <span>Product</span>

          <span>Category</span>

          <span>Price</span>

          <span>Stock</span>

          <span>Status</span>

          <span className="text-center">
            Actions
          </span>
        </div>

        {/* DESKTOP PRODUCT ROWS */}

        {paginatedProducts.map((post, index) => {
          const image = post.media?.find(
            (media) =>
              !media.isDeleted &&
              media.mediaUrl
          )?.mediaUrl;

          const productNumber =
            (currentPage - 1) * productsPerPage +
            index +
            1;

          return (
            <div
              key={post._id}
              className="
                grid
                grid-cols-[minmax(200px,2fr)_minmax(100px,1fr)_100px_80px_100px_70px]
                items-center
                gap-4
                border-b
                border-slate-100
                px-5
                py-5
                transition
                hover:bg-slate-50/50
              "
            >

              {/* PRODUCT */}

              <div
                className="
                  flex
                  min-w-0
                  cursor-pointer
                  items-center
                  gap-4
                "
                onClick={() =>
                  handleOpenActions(post)
                }
              >
                {/* IMAGE */}

                <div
                  className="
                    h-[72px]
                    w-[72px]
                    shrink-0
                    overflow-hidden
                    rounded-xl
                    border
                    border-slate-100
                    bg-slate-100
                  "
                >
                  {image ? (
                    <img
                      src={image}
                      alt={post.topic}
                      className="
                        h-full
                        w-full
                        object-cover
                      "
                    />
                  ) : (
                    <div
                      className="
                        flex
                        h-full
                        w-full
                        items-center
                        justify-center
                      "
                    >
                      <Package
                        size={28}
                        className="text-slate-400"
                      />
                    </div>
                  )}
                </div>

                {/* NAME + SKU */}

                <div className="min-w-0">
                  <p
                    className="
                      truncate
                      text-base
                      font-semibold
                      text-slate-900
                    "
                  >
                    {post.topic}
                  </p>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-slate-500
                    "
                  >
                    SKU: PRD
                    {String(productNumber).padStart(
                      3,
                      "0"
                    )}
                  </p>
                </div>
              </div>

              {/* CATEGORY */}

              <span
                className="
                  truncate
                  text-sm
                  text-slate-600
                "
              >
                {post.category || "Other"}
              </span>

              {/* PRICE */}

              <span
                className="
                  text-sm
                  font-semibold
                  text-slate-900
                "
              >
                {post.price?.currency || "₹"}
                {post.price?.amount ?? 0}
              </span>

              {/* STOCK */}

              <span
                className="
                  text-sm
                  font-semibold
                  text-slate-700
                "
              >
                {post.totalStock ?? 0}
              </span>

              {/* STATUS */}

              <div>
                <span
                  className={`
                    inline-flex
                    rounded-lg
                    px-3
                    py-2
                    text-xs
                    font-semibold
                    ${
                      post.isArchived
                        ? "bg-slate-100 text-slate-500"
                        : "bg-green-50 text-green-600"
                    }
                  `}
                >
                  {post.isArchived
                    ? "Archived"
                    : "Public"}
                </span>
              </div>

              {/* ACTION */}

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    handleOpenActions(post)
                  }
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    text-lg
                    font-bold
                    text-slate-700
                    shadow-sm
                    transition
                    hover:bg-slate-50
                  "
                >
                  ...
                </button>
              </div>
            </div>
          );
        })}

        {/* =================================================
            DESKTOP PAGINATION
        ================================================= */}

        <div
          className="
            flex
            items-center
            justify-between
            border-t
            border-slate-200
            px-5
            py-5
          "
        >
          {/* LEFT */}

          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-medium text-slate-700">
              {startProduct}
            </span>{" "}
            to{" "}
            <span className="font-medium text-slate-700">
              {endProduct}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-700">
              {totalProducts}
            </span>{" "}
            products
          </p>

          {/* RIGHT */}

          <div className="flex items-center gap-2">

            {/* PREVIOUS */}

            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.max(1, page - 1)
                )
              }
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                text-xl
                text-slate-500
                transition
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              ‹
            </button>

            {/* PAGE NUMBERS */}

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() =>
                  setCurrentPage(page)
                }
                className={`
                  flex
                  h-10
                  min-w-10
                  items-center
                  justify-center
                  rounded-xl
                  px-3
                  text-sm
                  font-semibold
                  transition
                  ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }
                `}
              >
                {page}
              </button>
            ))}

            {/* NEXT */}

            <button
              type="button"
              disabled={
                currentPage === totalPages
              }
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(
                    totalPages,
                    page + 1
                  )
                )
              }
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                text-xl
                text-slate-500
                transition
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              ›
            </button>

          </div>
        </div>
      </div>
    </>
  )}
</div>

      </div>

{selectedProduct && !showDeleteModal && (
  <ProductActionModal
    product={selectedProduct}
    onClose={() => setSelectedProduct(null)}
    userRole={selectedStoreRole}
    onEdit={() => {
      setEditingPost(selectedProduct);
      setSelectedProduct(null);
    }}

    onUpdateDiscount={() => {
      setDiscountProduct(selectedProduct);
      setSelectedProduct(null);
    }}

    onUpdateInventory={() => {
      setInventoryProduct(selectedProduct);
      setSelectedProduct(null);
    }}

    onManageMedia={() => {
      setManageMediaProduct(selectedProduct);
      setSelectedProduct(null);
    }}

    onArchive={() => {
      setArchiveProduct(selectedProduct);
      setSelectedProduct(null);
    }}

    onDelete={() => {
      setShowDeleteModal(true);
    }}
  />
)}

{inventoryProduct && (
  <UpdateInventoryModal
    post={inventoryProduct}
    onClose={() => {
      setInventoryProduct(null);
      setShowInventoryModal(false);
    }}
    onSuccess={() => {
      setInventoryProduct(null);
      setShowInventoryModal(false);
fetchProducts();
    }}
  />
)}

{discountProduct && (
  <UpdateDiscountModal
    post={discountProduct}
    onClose={() => {
      setDiscountProduct(null);
    }}
    onSuccess={() => {
      setDiscountProduct(null);

      fetchProducts();
    }}
  />
)}

{archiveProduct && (
  <ArchiveProductModal
    post={archiveProduct}
    onClose={() => {
      setArchiveProduct(null);
    }}
    onSuccess={() => {
      setArchiveProduct(null);

      fetchProducts();
    }}
  />
)}

{showDeleteModal && selectedProduct && (
  <DeleteProductModal
    post={selectedProduct}
    onClose={() => {
      setShowDeleteModal(false);
    }}
    onSuccess={() => {
      setShowDeleteModal(false);
      setSelectedProduct(null);

      fetchProducts();
    }}
  />
)}

{editingPost && (
  <EditPostModal
    post={editingPost}
    onClose={() => {
      setEditingPost(null);
    }}
    onSuccess={() => {
      setEditingPost(null);

      fetchProducts();
    }}
  />
)}

{manageMediaProduct && (
  <ManageMediaModal
    post={manageMediaProduct}
    onClose={() => {
      setManageMediaProduct(null);
    }}
    onSuccess={() => {
      setManageMediaProduct(null);

      fetchProducts();
    }}
  />
)}
    </main>
    </div>
  );
}