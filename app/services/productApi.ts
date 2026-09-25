import axios from "axios";

const BASE_URL = "https://api.thover.in/v1/api";

export const getUserProducts = async (
  userId: string,
  page: number = 1,
  limit: number = 10
) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Authentication token not found");
    }

    if (!userId) {
      throw new Error("User ID is required");
    }

    const { data } = await axios.get(
      `${BASE_URL}/post/user/${userId}/posts`,
      {
        params: {
          page,
          limit,
          status: "public",
          sortBy: "createdAt",
          sortOrder: "desc",
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("GET USER PRODUCTS:", data);

    return data;
  } catch (error: any) {
    console.error(
      "GET USER PRODUCTS ERROR:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export const getStoreProducts = async (
  storeId: string,
  page: number = 1,
  limit: number = 10
) => {
  const token =
    localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "Authentication token not found"
    );
  }

  if (!storeId) {
    throw new Error(
      "Store ID is required"
    );
  }

  const { data } = await axios.get(
    `https://api.thover.in/v2/api/post/store/${storeId}`,
    {
      params: {
        page,
        limit,
        status: "public",
        sortBy: "createdAt",
        sortOrder: "desc",
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
};