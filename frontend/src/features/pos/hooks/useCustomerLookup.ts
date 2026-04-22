import api from "@/lib/api";
import { useCallback, useState } from "react";
import type { CustomerInfo, CustomerSearchData } from "../data/types";
import { toast } from "sonner";

export function useCustomerLookup() {
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [loyalty, setLoyalty] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const resolveCustomer = useCallback(async (data: CustomerSearchData) => {
    setLoading(true);
    // try {
    //   let customer: CustomerInfo | null = null;
    //   const result = await api.post("/customers/auth/search", data);
    //   if (result.data.success && result.data.data) {
    //     customer = result.data.data;
    //   } 

    //   if (!customer) { 
    //     const result = await api.post("/customers/auth/register", data);
    //     if (!result.data.success) {
    //       toast.error(result.data.message || "Failed to create customer");
    //       console.log("Failed to create customer", result.data.message);
    //       throw new Error(result.data.message || "Failed to create customer");
    //     }
    //     customer = result.data.data;
    //   }

    //   setCustomer(customer);

    //   const loyaltyRes = await api.get(`/loyalty/${customer.id}/`);

    //     }
      
      
    //   else {
    //     toast.error(result.data.message || "Failed to find or create customer!");
    //     console.log("Failed to find or create customer", result.data.message);
    //     setCustomer(null);
    //   }
    //   setCustomer(customer);

    //   const loyaltyRes = await api.get(`/loyalty/${customer.id}/`);
    //   if (loyaltyRes.data.success) {
    //     setLoyalty(loyaltyRes.data.data);
    //   }

    //   return customer;

    // } catch (err) {
    //   console.error(err);
    //   throw err;
    // } finally {
    //   setLoading(false);
    // }
  }, []);

  const clearCustomer = () => {
    setCustomer(null);
    setLoyalty(0);
  };

  return {
    customer,
    loyalty,
    loading,
    resolveCustomer,
    clearCustomer,
  };
}