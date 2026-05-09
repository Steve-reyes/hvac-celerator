"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"

export interface AuthUser {
  id: string
  email: string
  fullName: string
  companyName: string
  companySlug: string
}

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}

export interface RegisterData {
  email: string
  password: string
  fullName: string
  companyName: string
}

const AuthContext = createContext<AuthContextValue | null>(null)

function generateId() {
  return Math.random().toString(36).substring(2, 15)
}

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
}

const STORAGE_KEY = "hvac-auth-user"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setUser(JSON.parse(stored))
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 600))

    const users = JSON.parse(localStorage.getItem("hvac-users") || "[]") as { email: string; password: string; user: AuthUser }[]
    const match = users.find((u) => u.email === email && u.password === password)

    if (!match) {
      setIsLoading(false)
      throw new Error("Invalid email or password")
    }

    setUser(match.user)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(match.user))
    setIsLoading(false)
  }, [])

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 800))

    const users = JSON.parse(localStorage.getItem("hvac-users") || "[]") as { email: string; password: string; user: AuthUser }[]

    if (users.some((u) => u.email === data.email)) {
      setIsLoading(false)
      throw new Error("An account with this email already exists")
    }

    const newUser: AuthUser = {
      id: generateId(),
      email: data.email,
      fullName: data.fullName,
      companyName: data.companyName,
      companySlug: slugify(data.companyName),
    }

    users.push({ email: data.email, password: data.password, user: newUser })
    localStorage.setItem("hvac-users", JSON.stringify(users))
    setUser(newUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
    setIsLoading(false)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    router.push("/login")
  }, [router])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
