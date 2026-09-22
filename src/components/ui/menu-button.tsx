import { MoreVertical } from "lucide-react";
import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

function MenuButton({
  onClick,
  ...props
}: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) {
  return (
    <button
      {...props}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      className="relative rounded-lg p-1 text-[#818ea8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
      aria-label="Document options"
    >
      <MoreVertical className="h-4 w-4" />
    </button>
  );
}

export default MenuButton;
