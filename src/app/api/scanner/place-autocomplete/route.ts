import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 503 })
  }

  const { searchParams } = new URL(request.url)
  const input = searchParams.get("input")

  if (!input || input.length < 3) {
    return NextResponse.json({ predictions: [] })
  }

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=establishment&language=en&key=${apiKey}`

  try {
    const res = await fetch(url)
    const data = await res.json()

    if (data.status !== "OK") {
      return NextResponse.json({ predictions: [] })
    }

    const predictions = (data.predictions || []).map((p: { place_id: string; description: string; structured_formatting?: { main_text: string; secondary_text: string } }) => ({
      placeId: p.place_id,
      description: p.description,
      mainText: p.structured_formatting?.main_text || p.description.split(",")[0],
      secondaryText: p.structured_formatting?.secondary_text || p.description.split(",").slice(1).join(",").trim(),
    }))

    return NextResponse.json({ predictions })
  } catch {
    return NextResponse.json({ predictions: [] })
  }
}
