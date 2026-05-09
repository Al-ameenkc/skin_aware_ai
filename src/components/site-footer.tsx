import Link from "next/link";
import { Flower2 } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/35 bg-white/35 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-12 md:flex-row md:items-center md:justify-between">
        <div className="flex shrink-0 items-center justify-center gap-3 md:justify-start">
          <span className="group flex h-11 w-11 shrink-0 cursor-default items-center justify-center rounded-2xl bg-[#6f3f45] text-white shadow-md shadow-[#6f3f45]/25 transition duration-300 ease-out hover:scale-110 hover:rotate-12 hover:shadow-lg">
            <Flower2 size={20} className="transition duration-300 group-hover:scale-110" aria-hidden />
          </span>
          <div className="min-w-0 text-center md:text-left">
            <p className="section-title text-lg text-[#5d3339]">PetalSense AI</p>
            <p className="text-xs text-[#7a575d] sm:text-sm">Beautiful skin guidance, thoughtfully designed.</p>
          </div>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm sm:gap-x-8 sm:gap-y-3 md:justify-end">
          <Link
            href="/"
            className="text-[#6f3f45] underline-offset-4 transition duration-200 hover:translate-x-1 hover:text-[#5d343a] hover:underline"
          >
            Home
          </Link>
          <Link
            href="/chat"
            className="text-[#6f3f45] underline-offset-4 transition duration-200 hover:translate-x-1 hover:text-[#5d343a] hover:underline"
          >
            Analyze &amp; chat
          </Link>
          <Link
            href="/history"
            className="text-[#6f3f45] underline-offset-4 transition duration-200 hover:translate-x-1 hover:text-[#5d343a] hover:underline"
          >
            History
          </Link>
        </nav>
      </div>
      <div className="border-t border-white/30 bg-white/20 px-4 py-4 text-center text-[11px] text-[#7a5b62] sm:text-xs">
        <p>PetalSense AI is a supportive tool, not a substitute for professional medical advice.</p>
        <p className="mt-1">© {new Date().getFullYear()} PetalSense AI. All rights reserved.</p>
      </div>
    </footer>
  );
}
