import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type BackToHomeButtonProps = {
  className?: string;
};

export function BackToHomeButton({ className = "" }: BackToHomeButtonProps) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-5 py-2.5 text-sm font-medium text-[#6f3f45] shadow-[0_8px_24px_rgba(111,63,69,0.12)] backdrop-blur-md transition duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.03] hover:border-[#e8c4d0] hover:bg-white hover:shadow-[0_16px_40px_rgba(111,63,69,0.18)] active:scale-[0.98] ${className}`}
    >
      <ArrowLeft
        size={18}
        className="transition group-hover:-translate-x-0.5"
        aria-hidden
      />
      Back to home
    </Link>
  );
}
