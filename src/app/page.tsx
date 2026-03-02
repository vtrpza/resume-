import Link from "next/link";
import { LandingTracker } from "@/components/LandingTracker";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Resume Gap Scanner
      </h1>
      <p className="mt-4 text-lg text-zinc-400">
        Upload your resume and paste the job description. Get a match score,
        missing keywords, ATS risks, and stronger bullet rewrites—no fluff.
      </p>
      <LandingTracker />
      <Link
        href="/scan"
        className="mt-8 inline-block rounded-lg bg-white px-6 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200"
      >
        Scan your resume
      </Link>
    </main>
  );
}
