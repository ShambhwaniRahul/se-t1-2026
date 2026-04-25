import { useState, useMemo } from "react";
import { type Customer } from "../data/crmData";

export function useCrm() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");

  // 🔥 Filtering logic (backend fields ke according)
  const filtered = useMemo(() => {
    if (!search) return customers;

    const q = search.toLowerCase();

    return customers.filter((c) => {
      const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
      const phone = c.phone_no || "";

      return (
        fullName.includes(q) ||
        phone.includes(q.replace(/\D/g, ""))
      );
    });
  }, [customers, search]);

  // 🔥 Setter (API se data daalne ke liye)
  const setCustomerData = (data: Customer[]) => {
    setCustomers(data);
  };

  return {
    customers: filtered,
    setCustomerData,
    search,
    setSearch,
  };
}
