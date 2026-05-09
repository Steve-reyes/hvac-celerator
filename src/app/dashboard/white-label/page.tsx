import { BrandingEditor } from "@/components/white-label/branding-editor"

export default function WhiteLabelPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">White-Label Engine</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Customize client-facing reports with your own branding
        </p>
      </div>

      <BrandingEditor />
    </div>
  )
}
