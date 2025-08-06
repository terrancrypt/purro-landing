import { cn } from "@/lib/utils";
import { useState } from "react";
import { Wallet } from "@/assets/wallet";

interface HoverCardProps {
  content: string;
  icon?: React.ComponentType<{ fill?: string }>;
}

const HoverCard = ({ content, icon: Icon = Wallet }: HoverCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      className={cn(
        "relative aspect-video bg-[#77b6b3] w-full md:w-[200px] rounded-[30px] transition-colors duration-500",
        isHovered && "bg-[#005b4a] cursor-pointer"
      )}
    >
      <div className="absolute top-0 left-0 w-full h-full rounded-[30px] p-2">
        <div
          className={cn(
            "bg-white w-full h-full rounded-[22px] text-center flex justify-center items-center transition-transform duration-500 ease-out text-xs sm:text-sm px-2",
            isHovered && "translate-y-[-50%] md:translate-y-[-70%]"
          )}
        >
          {content}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 w-full scale-[1.05] flex justify-center items-end translate-y-[2%]">
        <Icon fill={isHovered ? "#005b4a" : "#77b6b3"} />
      </div>
    </div>
  );
};

export default HoverCard;
