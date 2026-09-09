import Image from "next/image";
import { cn } from "@/lib/utils";

type ClubOneMarkProps = {
  className?: string;
  priority?: boolean;
};

export function ClubOneMark({ className, priority = false }: ClubOneMarkProps) {
  return (
    <Image
      src="/icon.svg"
      alt="Club One"
      width={48}
      height={48}
      priority={priority}
      className={cn("shrink-0", className)}
    />
  );
}
