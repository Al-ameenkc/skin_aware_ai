"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";

export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname === "/chat") return null;
  return <SiteFooter />;
}
