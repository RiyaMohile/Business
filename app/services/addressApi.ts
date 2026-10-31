import axios from "axios";

const BASE_URL = "https://api.thover.in/v1/api";

export interface CreateAddressPayload {
  name: string;
  street: string;
  area: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  latitude: number;
  longitude: number;
  isPrimary: boolean;
}

// POST /address/location reverse-geocodes the coordinates on the server and
// fails with "Unable to determine city, state, country or PIN code" when its
// lookup comes back empty. In that case, fall back to POST /address/ with the
// details the browser already resolved.
export const createAddress = async (
  payload: CreateAddressPayload,
  token: string
) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  try {
    const { data } = await axios.post(
      `${BASE_URL}/address/location`,
      payload,
      config
    );
    return data;
  } catch (error: any) {
    const hasClientDetails =
      payload.city &&
      payload.state &&
      payload.country &&
      payload.pinCode;

    if (
      !hasClientDetails ||
      error.response?.status >= 500 ||
      error.response?.status === 401
    ) {
      throw error;
    }

    const { data } = await axios.post(
      `${BASE_URL}/address/`,
      payload,
      config
    );
    return data;
  }
};
