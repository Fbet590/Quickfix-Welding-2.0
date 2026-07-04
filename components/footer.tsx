"use client"

import { Button } from "@/components/ui/button"

export function Footer() {
  const scrollToQuote = () => {
    document.getElementById("quote-form")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <footer className="text-card" style={{ backgroundColor: "#0D0D0D" }}>
      {/* CTA Section */}
      <div className="py-12" style={{ backgroundColor: "#0D0D0D" }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-white/90 mb-6 max-w-lg mx-auto">
            Contact us today for a free consultation and quote. Let&apos;s build something great together.
          </p>
          <Button 
              size="lg" 
              className="text-white hover:bg-opacity-90"
              style={{ backgroundColor: "#E0202A" }}
              onClick={scrollToQuote}
            >
              Get a Free Quote
            </Button>
        </div>
      </div>

      {/* Copyright */}
      <div className="py-6" style={{ backgroundColor: "#0D0D0D", borderTop: "1px solid #888" }}>
        <div className="container mx-auto px-4 text-center text-card/50 text-sm">
          <p>&copy; {new Date().getFullYear()} Quickfix Welding. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
