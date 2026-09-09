import Image from "next/image";
import { CLUB_ONE_LOGO_URL } from "@/lib/brand-assets";
import { cn } from "@/lib/utils";

type ClubOneMarkProps = {
  className?: string;
  priority?: boolean;
};

export function ClubOneMark({ className, priority = false }: ClubOneMarkProps) {
  return (
    <Image
      src={CLUB_ONE_LOGO_URL}
      alt="Club One"
      width={48}
      height={48}
      priority={priority}
      className={cn("shrink-0", className)}
    />
  );
}
