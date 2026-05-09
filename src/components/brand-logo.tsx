import { Flower2 } from "lucide-react";

type BrandLogoProps = {
  compact?: boolean;
};

export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <div className="group flex cursor-default items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#6f3f45] text-white shadow-lg shadow-[#6f3f45]/30 transition duration-300 ease-out group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-xl group-hover:shadow-[#6f3f45]/35">
        <Flower2 size={18} className="transition duration-300 group-hover:scale-110" aria-hidden />
      </div>
      <div>
        <p className={`section-title text-[#5d3339] ${compact ? "text-lg" : "text-xl"}`}>PetalSense AI</p>
        {!compact && <p className="text-xs text-[#7a575d]">Beautiful skin guidance</p>}
      </div>
    </div>
  );
}
