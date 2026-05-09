"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuth } from "@/components/auth/auth-context"
import { Building2, User, Mail, Lock } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.fullName.trim() || !formData.companyName.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError("All fields are required")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    try {
      await register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        companyName: formData.companyName,
      })
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mb-4">
            <span className="text-2xl font-bold text-[#FF6B00]">H-VAC</span>
            <span className="text-zinc-500">celerator</span>
          </Link>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Register your HVAC company to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <User className="h-3.5 w-3.5" />
                Your Full Name
              </label>
              <Input
                placeholder="John Smith"
                value={formData.fullName}
                onChange={handleChange("fullName")}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5" />
                Company Name
              </label>
              <Input
                placeholder="e.g. Premier HVAC Solutions"
                value={formData.companyName}
                onChange={handleChange("companyName")}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                Email
              </label>
              <Input
                type="email"
                placeholder="you@company.com"
                value={formData.email}
                onChange={handleChange("email")}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <Lock className="h-3.5 w-3.5" />
                Password
              </label>
              <Input
                type="password"
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={handleChange("password")}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <Lock className="h-3.5 w-3.5" />
                Confirm Password
              </label>
              <Input
                type="password"
                placeholder="Repeat your password"
                value={formData.confirmPassword}
                onChange={handleChange("confirmPassword")}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account & Add Company"}
            </Button>

            <p className="text-center text-sm text-zinc-500">
              Already have an account?{" "}
              <Link href="/login" className="text-[#FF6B00] hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}