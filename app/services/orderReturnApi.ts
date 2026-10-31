import axios from "axios";

const API_ORIGIN = "https://api.thover.in";

export type ReturnStatus = "requested" | "completed" | "rejected";

export interface ReturnRequest {
  id: string;
  orderNumber: string;
  productTitle: string;
  image: string;
  customerName: string;
  requestedAt: string;
  status: ReturnStatus;
  rawStatus: string;
  refundAmount: number | null;
  otp: string;
}

// The response shape is undocumented, so every field is read defensively.

const isObj = (v: any): v is Record<string, any> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

const str = (v: any) =>
  v === undefined || v === null ? "" : String(v).trim();

const pick = (sources: any[], keys: string[]): any => {
  for (const key of keys) {
    for (const src of sources) {
      if (isObj(src) && src[key] !== undefined && src[key] !== null && str(src[key]) !== "") {
        return src[key];
      }
    }
  }
  return undefined;
};

const toNumber = (v: any): number | null => {
  if (isObj(v)) v = pick([v], ["amount", "grandTotal", "totalPrice", "value"]);
  if (v === undefined || v === null || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/[₹,]/g, ""));
  return isNaN(n) ? null : n;
};

const extractImage = (sources: any[]): string => {
  const media = pick(sources, [
    "media", "mediaUrls", "images", "image", "photo",
    "thumbnail", "imageUrl", "mediaUrl", "productImage",
  ]);
  const fromItem = (item: any) =>
    typeof item === "string"
      ? item
      : isObj(item)
      ? str(item.mediaUrl ?? item.url ?? item.path ?? item.secure_url ?? item.src)
      : "";
  let url = Array.isArray(media) ? media.map(fromItem).find(Boolean) || "" : fromItem(media);
  if (url.startsWith("/")) url = API_ORIGIN + url;
  return url;
};

const normalizeStatus = (raw: string): ReturnStatus => {
  const s = raw.toLowerCase();
  if (/complete|success|refunded|verified|done/.test(s)) return "completed";
  if (/reject|declin|cancel|denied|expired|fail/.test(s)) return "rejected";
  return "requested";
};

export const parseReturn = (raw: any): ReturnRequest | null => {
  if (!isObj(raw)) return null;

  // orderId may be a plain id or a populated object
  const order = isObj(raw.orderId) ? raw.orderId : isObj(raw.order) ? raw.order : {};
  const item = Array.isArray(order.items) && isObj(order.items[0]) ? order.items[0] : {};
  const post = isObj(order.postDetails?.postId)
    ? order.postDetails.postId
    : isObj(order.postId)
    ? order.postId
    : {};
  const customer = isObj(raw.customerUserId)
    ? raw.customerUserId
    : isObj(order.customerUserId)
    ? order.customerUserId
    : isObj(raw.customer)
    ? raw.customer
    : {};

  const id = str(raw._id ?? raw.id ?? raw.returnId);
  if (!id) return null;

  const rawStatus = str(raw.status ?? raw.returnStatus);

  return {
    id,
    orderNumber: str(
      pick([order, raw], ["orderNumber", "orderNo", "orderCode"]) ??
        (typeof raw.orderId === "string" ? raw.orderId : "")
    ),
    productTitle:
      str(pick([post, item, order, raw], ["topic", "title", "productName", "name"])) ||
      "Product",
    image: extractImage([post, item, order, raw]),
    customerName:
      str(pick([customer, raw], ["name", "username", "customerName"])) || "Customer",
    requestedAt: str(pick([raw], ["createdAt", "requestedAt", "requestDate"])),
    status: normalizeStatus(rawStatus),
    rawStatus,
    refundAmount: toNumber(
      pick([raw, order], ["refundAmount", "refund", "amount", "grandTotal", "totalPrice"])
    ),
    otp: str(pick([raw], ["otp", "returnOtp", "returnOTP", "storeOtp"])),
  };
};

// GET /v2/api/order-returns/store-requests
export const getStoreReturnRequests = async (): Promise<ReturnRequest[]> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Authentication token not found");

  const { data } = await axios.get(`${API_ORIGIN}/v2/api/order-returns/store-requests`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const list: any[] = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.returns)
    ? data.returns
    : Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.data?.returns)
    ? data.data.returns
    : Array.isArray(data)
    ? data
    : [];

  return list.map(parseReturn).filter((r): r is ReturnRequest => r !== null);
};
