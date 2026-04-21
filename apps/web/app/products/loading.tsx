import { GridPageSkeleton } from "@/components/page-skeleton";

export default function Loading() {
  return <GridPageSkeleton title="در حال بارگذاری کاتالوگ محصولات" cards={6} />;
}
