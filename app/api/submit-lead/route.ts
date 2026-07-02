import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const body = await req.json()

  const leadConnectorUrl =
    "https://services.leadconnectorhq.com/hooks/XucZS735rmKlbQTCy59O/webhook-trigger/098f1338-837a-4232-a37b-ba5abd1fa2f0"

  const response = await fetch(leadConnectorUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    console.log("[v0] LeadConnector webhook failed:", response.status, await response.text())
    return NextResponse.json({ error: "Webhook delivery failed" }, { status: 502 })
  }

  return NextResponse.json({ success: true })
}
