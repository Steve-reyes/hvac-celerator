"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { generateGBPPost } from "@/services/content-engine"
import { Sparkles, Copy, Check, RefreshCw } from "lucide-react"

const HVAC_SERVICES = [
  "AC Repair",
  "HVAC Installation",
  "Emergency Service",
  "Maintenance",
  "Indoor Air Quality",
  "Commercial Refrigeration",
  "Boiler Repair",
  "Ductwork Installation",
]

interface ContentGeneratorProps {
  clientId: string
  clientName: string
}

export function ContentGenerator({ clientId, clientName }: ContentGeneratorProps) {
  const [selectedService, setSelectedService] = useState("")
  const [targetCity, setTargetCity] = useState("")
  const [generated, setGenerated] = useState<{ headline: string; body: string; cta: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = () => {
    if (!selectedService || !targetCity) return
    const result = generateGBPPost(selectedService, targetCity)
    setGenerated(result)
    setCopied(false)
  }

  const handleCopy = async () => {
    if (!generated) return
    const text = `${generated.headline}\n\n${generated.body}\n\n${generated.cta}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>AI Content Engine</CardTitle>
            <CardDescription>
              Generate GEO-optimized GBP posts for {clientName}
            </CardDescription>
          </div>
          <Sparkles className="h-5 w-5 text-[#FF6B00]" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-zinc-400 mb-2 block">
            Select Service
          </label>
          <div className="flex flex-wrap gap-2">
            {HVAC_SERVICES.map((service) => (
              <Badge
                key={service}
                variant={selectedService === service ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedService(service)}
              >
                {service}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-400 mb-2 block">
            Target City
          </label>
          <Input
            placeholder="e.g., Chicago, Phoenix, Miami..."
            value={targetCity}
            onChange={(e) => setTargetCity(e.target.value)}
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!selectedService || !targetCity}
          className="w-full"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Generate GBP Post
        </Button>

        {generated && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="success">Generated</Badge>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleGenerate}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#FF6B00]">{generated.headline}</h4>
              <p className="text-sm text-zinc-300 mt-2">{generated.body}</p>
              <div className="mt-3 p-2 rounded bg-[#FF6B00]/10 border border-[#FF6B00]/20">
                <span className="text-xs text-zinc-500">CTA: </span>
                <span className="text-sm font-medium text-[#FF6B00]">
                  {generated.cta}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
