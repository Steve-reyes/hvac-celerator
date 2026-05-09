"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapPin, Search, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PlaceSelection {
  placeId: string
  name: string
  address: string
}

interface PlacePickerProps {
  onSelect: (place: PlaceSelection) => void
  initialValue?: string
}

interface Prediction {
  placeId: string
  description: string
  mainText: string
  secondaryText: string
}

export function PlacePicker({ onSelect, initialValue }: PlacePickerProps) {
  const [query, setQuery] = useState(initialValue || "")
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [selected, setSelected] = useState<PlaceSelection | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchPredictions = useCallback(async (input: string) => {
    if (input.length < 3) {
      setPredictions([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/scanner/place-autocomplete?input=${encodeURIComponent(input)}`)
      const data = await res.json()
      setPredictions(data.predictions || [])
    } catch {
      setPredictions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (selected) return
    debounceRef.current = setTimeout(() => fetchPredictions(query), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, selected, fetchPredictions])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (prediction: Prediction) => {
    const place: PlaceSelection = {
      placeId: prediction.placeId,
      name: prediction.mainText,
      address: prediction.secondaryText,
    }
    setSelected(place)
    setQuery(prediction.description)
    setOpen(false)
    onSelect(place)
  }

  const handleClear = () => {
    setSelected(null)
    setQuery("")
    setPredictions([])
    onSelect({ placeId: "", name: "", address: "" })
    inputRef.current?.focus()
  }

  return (
    <div className="relative">
      <label className="text-sm font-medium text-zinc-400 flex items-center gap-2 mb-2">
        <MapPin className="h-3.5 w-3.5 text-[#FF6B00]" />
        Google Maps Listing
      </label>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <Input
          ref={inputRef}
          placeholder="Search for your business on Google Maps..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelected(null)
            setOpen(true)
          }}
          onFocus={() => { if (predictions.length > 0 || query.length >= 3) setOpen(true) }}
          className="pl-9 pr-8"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 animate-spin" />
        )}
        {selected && !loading && (
          <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" />
        )}
      </div>

      {open && predictions.length > 0 && !selected && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl max-h-60 overflow-y-auto"
        >
          {predictions.map((p, i) => (
            <button
              key={p.placeId}
              className={cn(
                "w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-zinc-800 transition-colors",
                i < predictions.length - 1 && "border-b border-zinc-800/50"
              )}
              onClick={() => handleSelect(p)}
            >
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-zinc-500" />
              <div>
                <p className="text-sm font-medium">{p.mainText}</p>
                <p className="text-xs text-zinc-500">{p.secondaryText}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="mt-2 flex items-center justify-between rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <div className="truncate">
              <p className="text-xs font-medium text-emerald-400 truncate">{selected.name}</p>
              <p className="text-[10px] text-zinc-500 truncate">{selected.address}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-6 text-[10px] text-zinc-500 hover:text-zinc-300" onClick={handleClear}>
            Change
          </Button>
        </div>
      )}

      {!selected && query.length >= 3 && !loading && predictions.length === 0 && (
        <p className="mt-1 text-[10px] text-zinc-600">
          No Google Maps listing found. Try a different search or the city name.
        </p>
      )}
    </div>
  )
}
