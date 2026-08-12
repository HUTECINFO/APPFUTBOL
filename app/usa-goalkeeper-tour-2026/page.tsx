import type { Metadata } from "next";
import { GoalkeeperTourPage } from "@/components/tour/goalkeeper-tour-page";

export const metadata: Metadata = {
  title: "USA Goalkeeper Tour 2026 | Club One by HUTEC",
  description:
    "Four elite goalkeeper clinics across Texas. Choose El Paso, Dallas–Fort Worth, Houston, or San Antonio and register for the USA Goalkeeper Tour 2026.",
};

export default function TourPage() {
  return (
    <GoalkeeperTourPage
      registrationLinks={{
        elPaso: process.env.NEXT_PUBLIC_JOTFORM_EL_PASO_URL || "",
        dallasFortWorth:
          process.env.NEXT_PUBLIC_JOTFORM_DALLAS_FORT_WORTH_URL || "",
        houston: process.env.NEXT_PUBLIC_JOTFORM_HOUSTON_URL || "",
        sanAntonio: process.env.NEXT_PUBLIC_JOTFORM_SAN_ANTONIO_URL || "",
      }}
    />
  );
}
