"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { buildCSSVariables } from "@/services/white-label"
import { DEFAULT_WHITE_LABEL } from "@/services/white-label"
import type { WhiteLabelConfig } from "@/types/database"
import { RotateCcw, Code } from "lucide-react"

export function BrandingEditor() {
  const [config, setConfig] = useState<WhiteLabelConfig>(DEFAULT_WHITE_LABEL)
  const [showCSS, setShowCSS] = useState(false)

  const handleReset = () => setConfig(DEFAULT_WHITE_LABEL)
  const cssVars = buildCSSVariables(config)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Brand Configuration</CardTitle>
              <CardDescription>
                Customize client-facing report branding
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Logo URL</Label>
            <Input
              placeholder="https://your-logo.png"
              value={config.logoUrl ?? ""}
              onChange={(e) => setConfig({ ...config, logoUrl: e.target.value || null })}
            />
          </div>

          <div className="space-y-2">
            <Label>Primary Color</Label>
            <div className="flex gap-3">
              <input
                type="color"
                value={config.primaryColor}
                onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                className="h-9 w-12 rounded border border-zinc-700 bg-transparent cursor-pointer"
              />
              <Input
                value={config.primaryColor}
                onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                className="flex-1 font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Font Family</Label>
            <Input
              value={config.fontFamily}
              onChange={(e) => setConfig({ ...config, fontFamily: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Report Header</Label>
            <Input
              value={config.reportHeader ?? ""}
              onChange={(e) => setConfig({ ...config, reportHeader: e.target.value || null })}
            />
          </div>

          <div className="space-y-2">
            <Label>Report Footer</Label>
            <Input
              value={config.reportFooter ?? ""}
              onChange={(e) => setConfig({ ...config, reportFooter: e.target.value || null })}
            />
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowCSS(!showCSS)}
          >
            <Code className="h-4 w-4 mr-2" />
            {showCSS ? "Hide" : "View"} CSS Variables
          </Button>

          {showCSS && (
            <pre className="rounded-lg bg-zinc-950 p-4 text-xs text-zinc-400 overflow-x-auto">
              {`:root {\n${Object.entries(cssVars)
                .map(([key, val]) => `  ${key}: ${val};`)
                .join("\n")}\n}`}
            </pre>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>How your reports will appear</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="rounded-xl border p-6 space-y-4"
            style={{
              fontFamily: config.fontFamily,
              "--preview-primary": config.primaryColor,
            } as React.CSSProperties}
          >
            {config.logoUrl && (
              <img
                src={config.logoUrl}
                alt="Logo"
                className="h-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none"
                }}
              />
            )}

            <div>
              <h3
                className="text-xl font-bold"
                style={{ color: config.primaryColor }}
              >
                {config.reportHeader || "SEO Performance Report"}
              </h3>
              <p className="text-sm text-zinc-400 mt-1">
                Generated for your HVAC client
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {["Map Rank", "Reviews", "Leads", "Keywords"].map((metric) => (
                <div
                  key={metric}
                  className="rounded-lg p-3"
                  style={{ backgroundColor: `${config.primaryColor}10` }}
                >
                  <p className="text-xs text-zinc-500">{metric}</p>
                  <p className="text-lg font-bold" style={{ color: config.primaryColor }}>
                    —
                  </p>
                </div>
              ))}
            </div>

            {config.reportFooter && (
              <p className="text-xs text-zinc-600 text-center pt-4 border-t border-zinc-800">
                {config.reportFooter}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
