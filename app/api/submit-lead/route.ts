import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const body = await req.json()

  const leadConnectorUrl =
    "https://services.leadconnectorhq.com/hooks/XucZS735rmKlbQTCy59O/webhook-trigger/098f1338-837a-4232-a37b-ba5abd1fa2f0"

  try {
    const response = await fetch(leadConnectorUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(body),
    })

    const responseText = await response.text()
    console.log("[v0] LeadConnector status:", response.status)
    console.log("[v0] LeadConnector response:", responseText)

    return NextResponse.json({ success: true, status: response.status })
  } catch (err) {
    console.log("[v0] LeadConnector fetch error:", err)
    return NextResponse.json({ error: "Webhook delivery failed", detail: String(err) }, { status: 500 })
  }
}
