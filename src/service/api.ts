import { BASE_URL } from "../constant";

const API = {
  async get<T = any>(endpoint: string, fullUrl = false): Promise<T> {
    const url = fullUrl ? endpoint : `${BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json() as T;
    } catch (error) {
      console.error(`API request failed for URL: ${url}`, error);
      throw error;
    }
  }
};

export default API;
