import { useState, useMemo, useCallback } from "react";
import { type Customer, type CustomerNote, MOCK_CUSTOMERS } from "./crmData";

export function useCrm() {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    customers.forEach((c) => c.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [customers]);

  const filtered = useMemo(() => {
    let result = customers;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.replace(/\D/g, "").includes(q.replace(/\D/g, "")) ||
          c.email.toLowerCase().includes(q)
      );
    }

    if (selectedTag !== "all") {
      result = result.filter((c) => c.tags.includes(selectedTag));
    }

    return result;
  }, [customers, search, selectedTag]);

  const addNote = useCallback((customerId: string, text: string) => {
    const note: CustomerNote = {
      id: `n-${Date.now()}`,
      text,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId ? { ...c, notes: [note, ...c.notes] } : c
      )
    );
  }, []);

  const deleteNote = useCallback((customerId: string, noteId: string) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? { ...c, notes: c.notes.filter((n) => n.id !== noteId) }
          : c
      )
    );
  }, []);

  return {
    customers: filtered,
    search,
    setSearch,
    selectedTag,
    setSelectedTag,
    allTags,
    addNote,
    deleteNote,
  };
}
