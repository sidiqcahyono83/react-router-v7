import { api } from "~/lib/axios";

export const CustomerAPI = {
  async getAll() {
    try {
      const response = await api.get("/customers");

      console.log("SUCCESS", response.status);
      console.log(response.data);

      return response.data.customers;
    } catch (error: any) {
      console.log("URL:", error.config?.url);
      console.log("STATUS:", error.response?.status);
      console.log("DATA:", error.response?.data);

      throw error;
    }
  },
};
