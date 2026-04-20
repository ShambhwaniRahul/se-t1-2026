import api from "@/lib/api";
import { TableCard } from "../components/TableCard";
import { useEffect, useState } from "react";
import type { Table } from "@/config/types/order";
import { toast } from "sonner";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ScanSearch } from "lucide-react";

export default function TablePage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const [formData, setFormData] = useState({
    table_number: 0,
    total_seats: 0,
    is_available: true,
  });

  const { role } = useAuth();
  const canManageTables = role && ["Owner", "Manager"].includes(role as string);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await api.get("/pos/dining-tables/");
      setTables(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch tables!");
      console.log("Failed to fetch tables:", err)
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    const table = tables.find((t) => t.id === id);
    if (!table) return;

    setSelectedTable(table);
    setFormData({
      table_number: table.table_number,
      total_seats: table.total_seats,
      is_available: table.is_available,
    });

    setShowEdit(true);
  };

  const handleDelete = (id: string) => {
    const table = tables.find((t) => t.id === id);
    if (!table) return;

    setSelectedTable(table);
    setShowDelete(true);
  };

  const openAddModal = () => {
    setFormData({
      table_number: 0,
      total_seats: 0,
      is_available: true,
    });
    setShowAdd(true);
  };

  const confirmDelete = async () => {
    if (!selectedTable) return;

    try {
      const result = await api.delete(`/pos/dining-tables/${selectedTable.id}/`);
      console.log(">>> DELETE RESPONSE", result.data)
      if (result.data.success) {
        toast.success(result.data.message || "Table deleted successfully");
      } else {
        toast.error(result.data.message || "Failed to delete the table!");
      }
    } catch (err) {
      toast.error("Failed to delete the table!");
      console.log(err);
    } finally {
      setShowDelete(false);
      setSelectedTable(null);
      fetchTables();
    }
  };

  const handleAddTable = async () => {
    try {
      const result = await api.post("/pos/dining-tables/", formData);
      if (result.data.success) {
        toast.success(result.data.message || "Table added!");
      } else {
        toast.error(result.data.message || "Failed to add a table!");
      }
    } catch (err) {
      toast.error("Failed to add a table!");
      console.log(err);
    } finally {
      setShowAdd(false);
      fetchTables();
    }
  };

  const handleUpdateTable = async () => {
    if (!selectedTable) return;

    try {
      const result = await api.patch(`/pos/dining-tables/${selectedTable.id}/`, {
        table_number: formData.table_number,
        total_seats: formData.total_seats,
      });

      if (result.data.success) {
        toast.success(result.data.message || "Table updated successfully!");
      } else {
        toast.error(result.data.message || "Failed to update the table!");
      } 
    } catch (err) {
      toast.error("Failed to update table");
      console.log(err);
    } finally {
      fetchTables();
      setShowEdit(false);
      setSelectedTable(null);
    }
  };

  return (
    <div className="p-6">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center p-8 bg-card rounded-xl shadow-2xl border text-center max-w-sm w-full mx-4">
            <ScanSearch className="h-12 w-12 text-primary animate-pulse mb-6" />
            <h3 className="text-xl font-semibold">Loading Tables</h3>
          </div>
        </div>
      )}

      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-semibold">Tables</h1>

        {
          canManageTables && 
          (
            <button
              onClick={openAddModal}
              className="bg-black text-white px-4 py-2 rounded"
            >
              + Add Table
            </button>
          )
        }
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {tables.map((table) => (
          <TableCard
            key={table.id}
            id={table.id}
            total_seats={table.total_seats}
            table_number={table.table_number}
            is_available={table.is_available}
            canManage={canManageTables}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {
        canManageTables && 
        (
          <>
            <Modal
              open={showAdd}
              onOpenChange={(o) => !o && setShowAdd(false)}
              title="Add Table"
              footer={
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowAdd(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddTable}>Create</Button>
                </div>
              }
            >
              <div className="flex flex-col gap-4">
                <label className="flex items-center gap-2">
                  T No.
                  <input
                    type="number"
                    id="table_number"
                    placeholder="Table Number"
                    value={formData.table_number}
                    onChange={(e) =>
                      setFormData({ ...formData, table_number: Number(e.target.value) })
                    }
                    className="w-100 border p-2 rounded"
                  />
                </label>

                <label className="flex items-center gap-2">
                  Seats
                  <input
                    type="number"
                    id="total_seats"
                    placeholder="Seats"
                    value={formData.total_seats}
                    onChange={(e) =>
                      setFormData({ ...formData, total_seats: Number(e.target.value) })
                    }
                    className="w-100 border p-2 rounded"
                  />
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) =>
                      setFormData({ ...formData, is_available: e.target.checked })
                    }
                  />
                  Available
                </label>
              </div>
            </Modal>

            <Modal
              open={showEdit}
              onOpenChange={(o) => !o && setShowEdit(false)}
              title="Edit Table"
              description={`Table ${selectedTable?.id}`}
              footer={
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowEdit(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateTable}>Save</Button>
                </div>
              }
            >
              <div className="flex flex-col gap-4">
                <label className="flex items-center gap-2">
                  T No.
                  <input
                    type="number"
                    id="edit_table_number"
                    value={formData.table_number}
                    onChange={(e) =>
                      setFormData({ ...formData, table_number: Number(e.target.value) })
                    }
                    className="w-100 border p-2 rounded"
                  />
                </label>

                <label className="flex items-center gap-2">
                  Seats
                  <input
                    type="number"
                    id="edit_total_seats"
                    value={formData.total_seats}
                    onChange={(e) =>
                        setFormData({ ...formData, total_seats: Number(e.target.value) })
                      }
                      className="w-100 border p-2 rounded"
                    />
                </label>
              </div>
            </Modal>

            <Modal
              open={showDelete}
              onOpenChange={(o) => {
                if (!o) {
                  setShowDelete(false);
                  setSelectedTable(null);
                }
              }}
              title="Delete Table"
              description={`Are you sure you want to delete table ${selectedTable?.table_number}? This action cannot be undone.`}
              footer={
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowDelete(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDelete}>
                  Delete
                </Button>
              </div>
              }
              children={undefined}
            />
          </>
        )
      }

    </div>
  );
}