import { useNavigate } from "react-router-dom";
import { Trash2, Pencil, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

  return (
    <Card 
      onClick={handleClick}
      className={cn(
        "relative group overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        is_available 
          ? "glass-panel border-border/50 hover:border-primary/50" 
          : "bg-primary/5 border-primary/20 hover:border-primary/40"
      )}
    >
      {/* Top Gradient Accent */}
      <div className={cn(
        "absolute top-0 left-0 w-full h-1 transition-colors duration-300",
        is_available ? "bg-emerald-500/50 group-hover:bg-emerald-500" : "bg-primary/50 group-hover:bg-primary"
      )} />

      <div className="p-6 flex flex-col items-center justify-center gap-4">
        {/* Table Number Circle */}
        <div className={cn(
          "flex h-20 w-20 items-center justify-center rounded-full border-4 shadow-sm transition-transform duration-500 group-hover:scale-110",
          is_available ? "bg-card border-emerald-500/20 text-emerald-600" : "bg-primary/10 border-primary/20 text-primary"
        )}>
          <span className="text-3xl font-bold tracking-tighter">
            {table_number}
          </span>
        </div>

        {/* Info Area */}
        <div className="flex flex-col items-center gap-2">
          <Badge variant={is_available ? "outline" : "default"} className={cn("px-3 py-1", is_available && "border-emerald-500/30 text-emerald-600")}>
            {is_available ? "Available" : "Occupied"}
          </Badge>
          
          <div className="flex items-center text-muted-foreground text-sm font-medium">
            <Users className="w-4 h-4 mr-1.5" />
            {total_seats} Seats
          </div>
        </div>
      </div>

      {/* Action Buttons overlay */}
      {canManage && (
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 transform translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(id);
            }}
            className="flex items-center justify-center h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border shadow-sm text-muted-foreground hover:text-primary hover:bg-background transition-colors"
            title="Edit Table"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            className="flex items-center justify-center h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border shadow-sm text-muted-foreground hover:text-destructive hover:bg-background transition-colors"
            title="Delete Table"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </Card>
  );
}