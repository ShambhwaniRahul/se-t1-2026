import { useNavigate } from "react-router-dom";
import tableOccupied from "@/assets/table-occupied.png";
import tableEmpty from "@/assets/table-empty.png";
import { Trash2, Pencil } from "lucide-react";

interface TableCardProps {
  id: string;
  total_seats: number;
  table_number: number;
  is_available: boolean;
  canManage: boolean;  
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TableCard({ id, table_number, total_seats, is_available, canManage, onEdit, onDelete }: TableCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/pos/tables/${id}`);
  };

  const imageSrc = is_available ? tableEmpty: tableOccupied;

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="relative flex items-center justify-center transition-transform hover:scale-105"
      >
        <img
          src={imageSrc}
          alt={`Table ${table_number}`}
          className="w-45 h-45 object-contain"
        />

        <span className="absolute text-xl font-bold text-dark drop-shadow">
          {table_number} ({total_seats} seats)
        </span>
      </button>

      {
        canManage &&
        (
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(id);
              }}
              className="bg-orange-100 p-1 rounded-full shadow hover:bg-gray-100"
            >
              <Pencil size={16} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id);
              }}
              className="bg-red-100 p-1 rounded-full shadow hover:bg-red-100"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )
      } 
      
    </div>

  );
}