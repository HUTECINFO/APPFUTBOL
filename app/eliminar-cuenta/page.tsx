import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Eliminación de cuenta y datos | Club One",
};

export default function DeleteAccountPage() {
  return <LegalPage type="deletion" />;
}
