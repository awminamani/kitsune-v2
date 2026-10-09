import { Suspense } from "react";
import BrowseView from "@/components/BrowseView";

export const metadata = {
  title: "Browse — Kitsune",
  description: "Filter 20,000+ anime by genre, format, season, year and rating.",
};

export default function Browse() {
  return (
    <Suspense fallback={<div className="shell section" />}>
      <BrowseView />
    </Suspense>
  );
}
