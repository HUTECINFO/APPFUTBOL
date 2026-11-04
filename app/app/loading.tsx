import { PageSkeleton } from "@/components/layout/page-skeleton";

export default function Loading() {
  return <PageSkeleton className="pt-[calc(env(safe-area-inset-top,0px)+1.5rem)]" />;
}
