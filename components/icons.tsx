// Icons — lucide-react, currentColor, no icon font.
import { Compass as CompassIcon, Home as HomeIcon, Play as PlayIcon, Search as SearchIcon, Sliders as SlidersIcon, Star as StarIcon } from "lucide-react";

export function Search({ size = 19 }: { size?: number }) {
  return <SearchIcon size={size} aria-hidden="true" />;
}
export function Home({ size = 20 }: { size?: number }) {
  return <HomeIcon size={size} aria-hidden="true" />;
}
export function Compass({ size = 20 }: { size?: number }) {
  return <CompassIcon size={size} aria-hidden="true" />;
}
export function Sliders({ size = 20 }: { size?: number }) {
  return <SlidersIcon size={size} aria-hidden="true" />;
}
export function Play({ size = 14 }: { size?: number }) {
  return <PlayIcon size={size} aria-hidden="true" />;
}
export function Star({ size = 12 }: { size?: number }) {
  return <StarIcon size={size} fill="currentColor" strokeWidth={0} aria-hidden="true" />;
}
