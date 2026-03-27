import TableCard from "../components/TableComponent";
import { TABLES } from "../data/posData";

export default function TablePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Tables</h1>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {TABLES.map((table) => (
          <TableCard
            key={table.id}
            id={table.id}
            status={table.status}
          />
        ))}
      </div>
    </div>
  );
}