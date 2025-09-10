import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Button = ({
  children,
  onClick,
  isToast = false,
  toastMessage = "Coming soon",
  className,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  isToast?: boolean;
  toastMessage?: string;
  className?: string;
  disabled?: boolean;
}) => {
  return (
    <button
      className={cn(
        "bg-[#02f1dc] rounded-full px-4 py-2 cursor-pointer hover:bg-[#02f1dc]/80 transition-all duration-300 flex items-center gap-2",
        disabled && "opacity-50 cursor-not-allowed hover:bg-[#02f1dc]",
        className
      )}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        if (isToast) {
          toast(toastMessage);
        } else {
          onClick?.();
        }
      }}
    >
      {children}
    </button>
  );
};

export default Button;
