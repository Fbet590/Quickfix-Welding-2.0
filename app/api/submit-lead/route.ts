import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const body = await req.json()

  const leadConnectorUrl =
    "https://services.leadconnectorhq.com/hooks/XucZS735rmKlbQTCy59O/webhook-trigger/098f1338-837a-4232-a37b-ba5abd1fa2f0"

  // Split name into first/last for GHL contact mapping
  const nameParts = (body.name || "").trim().split(" ")
  const firstName = nameParts[0] || ""
  const lastName = nameParts.slice(1).join(" ") || ""

  const payload = {
    // Standard GHL field names
    firstName,
    lastName,
    email: body.email,
    phone: body.phone,
    // Custom fields
    gateType: body.gateType,
    submittedAt: body.submittedAt,
    // Full name as fallback
    name: body.name,
    source: "Quickfix Welding Landing Page",
  }

  try {
    const response = await fetch(leadConnectorUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const responseText = await response.text()
    console.log("[v0] LeadConnector status:", response.status)
    console.log("[v0] LeadConnector response:", responseText)

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      ghlResponse: responseText,
    })
  } catch (err) {
    console.log("[v0] LeadConnector fetch error:", err)
    return NextResponse.json({ error: "Webhook delivery failed", detail: String(err) }, { status: 500 })
  }
}
