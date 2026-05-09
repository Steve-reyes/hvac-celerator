import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center gap-6 text-center max-w-lg mx-auto px-4">
        <div className="flex items-center gap-2">
          <span className="text-4xl font-bold text-[#FF6B00]">H-VAC</span>
          <span className="text-2xl text-zinc-500">celerator</span>
        </div>
        <p className="text-zinc-400 text-sm">
          Enterprise SEO management platform for HVAC agencies.
          Monitor rankings, analyze competitors, and generate content — all in one place.
        </p>
        <div className="flex gap-3">
          <Link href="/dashboard">
            <Button size="lg">Enter Dashboard</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">Sign In</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
