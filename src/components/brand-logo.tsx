import { Flower2 } from "lucide-react";

type BrandLogoProps = {
  compact?: boolean;
  className?: string;
};

export function BrandLogo({ compact = false, className = "" }: BrandLogoProps) {
  return (
    <div className={`group flex shrink-0 cursor-default items-center gap-2 ${className}`}>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#6f3f45] text-white shadow-lg shadow-[#6f3f45]/30 transition duration-300 ease-out group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-xl group-hover:shadow-[#6f3f45]/35">
        <Flower2 size={18} className="transition duration-300 group-hover:scale-110" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className={`section-title leading-tight text-[#5d3339] ${compact ? "text-base sm:text-lg" : "text-lg sm:text-xl"}`}>
          PetalSense AI
        </p>
        {!compact && <p className="hidden text-xs text-[#7a575d] sm:block">Beautiful skin guidance</p>}
      </div>
    </div>
  );
}
