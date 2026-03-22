import { useNavigate } from "react-router-dom";
import tableOccupied from "@/assets/table-occupied.png";
import tableEmpty from "@/assets/table-empty.png";

interface TableCardProps {
  id: string;
  status: boolean;
}

export default function TableCard({ id, status }: TableCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/pos/${id}`);
  };

  const imageSrc = status ? tableOccupied : tableEmpty;

  return (
    <button
      onClick={handleClick}
      className="relative flex items-center justify-center transition-transform hover:scale-105"
    >
      <img
        src={imageSrc}
        alt={`Table ${id}`}
        className="w-45 h-45 object-contain"
      />

      <span className="absolute text-xl font-bold text-dark drop-shadow">
        {id}
      </span>
    </button>
  );

  // return (
  //   <Card
  //     onClick={handleClick}
  //     className={`w-32 h-32 flex items-center justify-center cursor-pointer ${bgColor}`}
  //   >
  //     <CardContent className="flex items-center justify-center h-full">
  //       <span className="text-xl font-bold text-white">Table {id}</span>
  //     </CardContent>
  //   </Card>
  // );
}