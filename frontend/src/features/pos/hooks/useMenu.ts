import { useEffect, useState } from "react";
import api from "@/lib/api";
import { type MenuItem } from "@/config/types/order";

export function useMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await api.get("/menu-items/");
        setItems(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  return { items, loading };
}