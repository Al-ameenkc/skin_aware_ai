"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Leaf, ShieldCheck } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-20 md:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="rounded-[1.75rem] border border-white/45 bg-white/26 p-5 shadow-[0_20px_45px_rgba(111,63,69,0.12)] backdrop-blur-xl transition duration-500 ease-out hover:-translate-y-1 hover:border-white/55 hover:bg-white/32 hover:shadow-[0_28px_60px_rgba(111,63,69,0.18)] sm:p-8 md:rounded-4xl md:p-12"
      >
        <p className="mb-4 inline-flex max-w-full rounded-full bg-white/70 px-3 py-1.5 text-xs text-[#6f3f45] transition duration-300 hover:scale-[1.02] hover:bg-white/85 hover:shadow-md sm:px-4 sm:py-2 sm:text-sm">
          Beautiful, personalized skincare intelligence
        </p>
        <h1 className="section-title max-w-3xl text-2xl leading-[1.15] text-[#5e343b] sm:text-4xl sm:leading-tight md:text-5xl">
          Skin-Aware AI that feels modern, elegant, and uniquely yours.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#6a4a50] sm:mt-5 sm:text-lg">
          Start with a quick skin check, explore your history, and chat with your personal skincare assistant for
          practical routine guidance.
        </p>
        <div className="mt-6 sm:mt-7">
          <Link
            href="/chat"
            className="inline-flex w-full justify-center rounded-2xl bg-[#6f3f45] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#6f3f45]/28 transition duration-300 ease-out hover:scale-[1.02] hover:bg-[#5d343a] hover:shadow-xl hover:shadow-[#6f3f45]/35 active:scale-[0.98] sm:w-auto sm:px-8"
          >
            Analyze My Skin
          </Link>
        </div>
      </motion.div>

      <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { icon: Sparkles, title: "Skin Intelligence", text: "Intelligent AI skin concern confidence scores." },
          { icon: Leaf, title: "Routine Guidance", text: "Personal routines built from your skin profile and goals." },
          { icon: ShieldCheck, title: "Private Records", text: "Top-notch security for personal records per account." },
        ].map((item) => (
          <motion.article
            key={item.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="group glass-panel glass-panel-hover cursor-default rounded-3xl p-4 sm:p-5"
          >
            <item.icon className="mb-3 h-7 w-7 text-[#7d4f56] transition duration-300 ease-out group-hover:scale-110 group-hover:text-[#6f3f45] group-hover:drop-shadow-sm sm:h-8 sm:w-8" />
            <h3 className="section-title text-xl text-[#5f343a] sm:text-2xl">{item.title}</h3>
            <p className="mt-1 text-[#6a4a50]">{item.text}</p>
          </motion.article>
        ))}
      </div>
      <div className="mt-10 grid gap-5 sm:mt-12 sm:gap-6 md:grid-cols-2">
        <article className="glass-panel glass-panel-hover min-h-0 cursor-default rounded-[1.75rem] p-6 sm:min-h-[200px] sm:p-8 md:min-h-[240px] md:p-10">
          <h3 className="section-title text-2xl text-[#5f343a] sm:text-3xl">How It Works</h3>
          <p className="mt-3 text-sm leading-relaxed text-[#6a4a50] sm:mt-4 sm:text-base md:text-lg">
            Log in, then use Snap skin in chat to upload a photo, receive concern insights, ask follow-up questions, and
            track your skincare progress in history.
          </p>
        </article>
        <article className="glass-panel glass-panel-hover min-h-0 cursor-default rounded-[1.75rem] p-6 sm:min-h-[200px] sm:p-8 md:min-h-[240px] md:p-10">
          <h3 className="section-title text-2xl text-[#5f343a] sm:text-3xl">Why You Will Love It</h3>
          <p className="mt-3 text-sm leading-relaxed text-[#6a4a50] sm:mt-4 sm:text-base md:text-lg">
            Fast, calm, and modern experience with elegant visuals, confidence-based insights, and practical skincare
            answers that stay easy to understand.
          </p>
        </article>
      </div>
    </section>
  );
}
