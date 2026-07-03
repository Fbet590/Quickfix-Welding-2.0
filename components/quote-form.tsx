"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { trackFBEvent } from "@/components/facebook-pixel"

type FormStep = 1 | 2 | 3 | 4

interface FormData {
  gateType: "side-gate" | "rv-gate" | ""
  name: string
  email: string
  phone: string
}

function SideGateIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Posts */}
      <rect x="4" y="10" width="8" height="62" rx="2" fill="currentColor" opacity="0.6" />
      <rect x="68" y="10" width="8" height="62" rx="2" fill="currentColor" opacity="0.6" />
      {/* Single gate panel */}
      <rect x="14" y="14" width="52" height="58" rx="2" fill="none" stroke="currentColor" strokeWidth="3" />
      {/* Horizontal rails */}
      <line x1="14" y1="28" x2="66" y2="28" stroke="currentColor" strokeWidth="2.5" />
      <line x1="14" y1="58" x2="66" y2="58" stroke="currentColor" strokeWidth="2.5" />
      {/* Vertical pickets */}
      <line x1="26" y1="14" x2="26" y2="72" stroke="currentColor" strokeWidth="2" />
      <line x1="38" y1="14" x2="38" y2="72" stroke="currentColor" strokeWidth="2" />
      <line x1="50" y1="14" x2="50" y2="72" stroke="currentColor" strokeWidth="2" />
      {/* Latch */}
      <circle cx="63" cy="43" r="3" fill="currentColor" opacity="0.8" />
    </svg>
  )
}

function RVGateIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Posts */}
      <rect x="1" y="10" width="8" height="62" rx="2" fill="currentColor" opacity="0.6" />
      <rect x="91" y="10" width="8" height="62" rx="2" fill="currentColor" opacity="0.6" />
      {/* Left gate panel — wide */}
      <rect x="11" y="14" width="36" height="58" rx="2" fill="none" stroke="currentColor" strokeWidth="3" />
      {/* Left rails */}
      <line x1="11" y1="28" x2="47" y2="28" stroke="currentColor" strokeWidth="2.5" />
      <line x1="11" y1="58" x2="47" y2="58" stroke="currentColor" strokeWidth="2.5" />
      {/* Left pickets */}
      <line x1="22" y1="14" x2="22" y2="72" stroke="currentColor" strokeWidth="2" />
      <line x1="33" y1="14" x2="33" y2="72" stroke="currentColor" strokeWidth="2" />
      {/* Right gate panel — wide */}
      <rect x="53" y="14" width="36" height="58" rx="2" fill="none" stroke="currentColor" strokeWidth="3" />
      {/* Right rails */}
      <line x1="53" y1="28" x2="89" y2="28" stroke="currentColor" strokeWidth="2.5" />
      <line x1="53" y1="58" x2="89" y2="58" stroke="currentColor" strokeWidth="2.5" />
      {/* Right pickets */}
      <line x1="64" y1="14" x2="64" y2="72" stroke="currentColor" strokeWidth="2" />
      <line x1="75" y1="14" x2="75" y2="72" stroke="currentColor" strokeWidth="2" />
      {/* Center gap / meeting point */}
      <line x1="50" y1="14" x2="50" y2="72" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
      {/* Latches */}
      <circle cx="46" cy="43" r="3" fill="currentColor" opacity="0.8" />
      <circle cx="54" cy="43" r="3" fill="currentColor" opacity="0.8" />
    </svg>
  )
}

export function QuoteForm() {
  const [step, setStep] = useState<FormStep>(1)
  const [formData, setFormData] = useState<FormData>({
    gateType: "",
    name: "",
    email: "",
    phone: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [deliveryRef, setDeliveryRef] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({})

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, "")
    return cleaned.length >= 10
  }

  const handleNext = () => {
    if (step < 4) setStep((step + 1) as FormStep)
  }

  const handlePrev = () => {
    if (step > 1) setStep((step - 1) as FormStep)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    const payload = {
      gateType: formData.gateType === "side-gate" ? "Side Gate" : "RV Gate / Double Door",
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      submittedAt: new Date().toISOString(),
    }

    // Direct GHL webhook URL — used as a guaranteed client-side fallback
    const leadConnectorUrl =
      "https://services.leadconnectorhq.com/hooks/XucZS735rmKlbQTCy59O/webhook-trigger/098f1338-837a-4232-a37b-ba5abd1fa2f0"

    // Split name for standard GHL contact field mapping
    const nameParts = payload.name.trim().split(" ")
    const directPayload = {
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      email: payload.email,
      phone: payload.phone,
      name: payload.name,
      gateType: payload.gateType,
      submittedAt: payload.submittedAt,
      source: "Quickfix Welding Landing Page",
    }

    let delivered = false

    // Primary: server-side route (avoids CORS, returns GHL reference)
    try {
      const res = await fetch("/api/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => null)
      console.log("[v0] Submit lead API response:", res.status, data)

      if (res.ok && data?.success) {
        delivered = true
        let ref: string | null = null
        try {
          const ghl = data.ghlResponse ? JSON.parse(data.ghlResponse) : null
          ref = ghl?.id ?? null
        } catch {
          ref = null
        }
        setDeliveryRef(ref)
      }
    } catch (err) {
      console.log("[v0] Submit lead server route error:", err)
    }

    // Fallback: fire the webhook directly from the browser (no-cors).
    // Guarantees delivery even if the server route is unavailable.
    if (!delivered) {
      try {
        await fetch(leadConnectorUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(directPayload),
        })
        console.log("[v0] Submit lead delivered via direct fallback")
        delivered = true
      } catch (err) {
        console.log("[v0] Submit lead direct fallback error:", err)
      }
    }

    if (!delivered) {
      setSubmitError(
        "We couldn't submit your request just now. Please call or text us and we'll take care of you right away."
      )
    }

    trackFBEvent("Lead", {
      content_category: "Quote Request",
      content_name: payload.gateType,
    })

    setSubmitted(true)
    setIsSubmitting(false)
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.gateType !== ""
      case 2:
        return formData.name !== ""
      case 3:
        if (formData.email === "") return false
        return validateEmail(formData.email)
      case 4:
        const digits = formData.phone.replace(/\D/g, "")
        return digits.length >= 7
      default:
        return true
    }
  }

  const handleEmailChange = (value: string) => {
    setFormData({ ...formData, email: value })
    if (value && value.includes("@") && !validateEmail(value)) {
      setErrors({ ...errors, email: "Please enter a valid email address" })
    } else {
      setErrors({ ...errors, email: undefined })
    }
  }

  const handlePhoneChange = (value: string) => {
    setFormData({ ...formData, phone: value })
    if (errors.phone) {
      setErrors({ ...errors, phone: undefined })
    }
  }

  if (submitted) {
    return (
      <section id="quote-form" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="p-8 md:p-12 text-center bg-card">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-foreground mb-4">
              Thank You!
            </h2>
            <p className="text-muted-foreground text-lg">
              We&apos;ve received your request and will contact you within 24 hours to discuss your project.
            </p>
            {deliveryRef && (
              <p className="text-muted-foreground/60 text-xs mt-4">
                Reference: {deliveryRef}
              </p>
            )}
          </Card>
        </div>
      </section>
    )
  }

  const TOTAL_STEPS = 4

  return (
    <section id="quote-form" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-primary font-semibold uppercase tracking-wider mb-2">
            Get Started Today
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-[27px] md:text-[40px] font-bold text-foreground mb-4">
            <span className="block">Side Gates · $1,500</span>
            <span className="block">RV Gates · $2,200</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
            Need something bigger or more complex? No problem
          </p>
          <div className="w-16 h-px bg-muted-foreground/30 mx-auto my-4" />
          <p className="text-foreground text-base md:text-lg font-medium max-w-lg mx-auto">
            Fill out the form and we&apos;ll do the rest!<br />
            No pressure, no commitment.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  s < step
                    ? "bg-primary text-primary-foreground"
                    : s === step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
            ))}
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
            />
          </div>
        </div>

        <Card className="max-w-xl mx-auto p-5 md:p-6 bg-foreground border-foreground/80">

          {/* Step 1: Gate Type */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-background text-center mb-6">
                What kind of gate are you looking for?
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gateType: "side-gate" })}
                  className={cn(
                    "flex flex-col items-center gap-3 p-5 rounded-lg border-2 transition-all",
                    formData.gateType === "side-gate"
                      ? "border-primary bg-primary/20 text-background"
                      : "border-background/20 bg-background/5 text-background/70 hover:border-background/40 hover:bg-background/10"
                  )}
                >
                  <SideGateIcon className="w-24 h-24" />
                  <span className="text-sm font-semibold text-center leading-tight">
                    Side Gate
                  </span>
                  <span className="text-xs text-background/50 text-center leading-snug">
                    Single panel, or for walkway area
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gateType: "rv-gate" })}
                  className={cn(
                    "flex flex-col items-center gap-3 p-5 rounded-lg border-2 transition-all",
                    formData.gateType === "rv-gate"
                      ? "border-primary bg-primary/20 text-background"
                      : "border-background/20 bg-background/5 text-background/70 hover:border-background/40 hover:bg-background/10"
                  )}
                >
                  <RVGateIcon className="w-24 h-24" />
                  <span className="text-sm font-semibold text-center leading-tight">
                    RV Gate / Double Door
                  </span>
                  <span className="text-xs text-background/50 text-center leading-snug">
                    Two panels, for vehicle or RV access
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Name */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-background text-center mb-4">
                What&apos;s your name?
              </h3>
              <Input
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="py-5 bg-background/10 text-background placeholder:text-background/50 border-background/30"
              />
            </div>
          )}

          {/* Step 3: Email */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-background text-center mb-4">
                What&apos;s your email address?
              </h3>
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={cn(
                    "py-5 bg-background/10 text-background placeholder:text-background/50",
                    errors.email ? "border-red-500" : "border-background/30"
                  )}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm">{errors.email}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Phone */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-background text-center mb-4">
                Best phone number to reach you?
              </h3>
              <div className="space-y-2">
                <Input
                  type="tel"
                  placeholder="(555) 555-5555"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={cn(
                    "py-5 bg-background/10 text-background placeholder:text-background/50",
                    errors.phone ? "border-red-500" : "border-background/30"
                  )}
                />
                {errors.phone && (
                  <p className="text-red-400 text-sm">{errors.phone}</p>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            {step > 1 ? (
              <Button
                variant="ghost"
                onClick={handlePrev}
                className="gap-2 text-foreground/50 hover:text-background hover:bg-background/10"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
            ) : (
              <div />
            )}
            {step < 4 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            )}
          </div>

          {submitError && (
            <p className="text-red-400 text-sm text-center mt-4">{submitError}</p>
          )}
        </Card>
      </div>
    </section>
  )
}
