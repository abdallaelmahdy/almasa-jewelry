/**
 * Unauthenticated public API client for the storefront.
 * No Authorization header — these endpoints require no login.
 */
import axios from "axios";

const PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const publicApi = axios.create({
  baseURL: PUBLIC_API_URL,
  withCredentials: false,
});

export interface PublicGoldPrice {
  karat: number;
  price_per_gram: string;
  effective_from: string;
}

export interface PublicProduct {
  id: string;
  sku: string;
  status: string;
  weight: string;
  karat: number;
  product: {
    id: number;
    name: string;
    image_url: string | null;
    category: { id: number; name: string };
  };
}
