import { useState, useEffect } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/50 backdrop-blur-xl border-b border-white/30 shadow-[0_4px_30px_rgba(108,92,231,0.06)]' : ''}`}>
      <div className="max-w-[980px] mx-auto px-6 flex items-center justify-between h-14">
        <a href="#" className="text-[18px] font-medium text-[#1a1a2e]" style={{ fontFamily: "'Playfair Display', serif" }}>
          CompletedBy
        </a>
        <div className="hidden sm:flex items-center gap-7">
          <a href="#features" className="text-[13px] text-[#64648C] hover:text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="text-[13px] text-[#64648C] hover:text-primary transition-colors">How It Works</a>
          <a href="#cta" className="text-[13px] font-medium text-white bg-primary hover:bg-primary-hover px-5 py-2 rounded-full transition-colors">Build My AI Employee</a>
        </div>
      </div>
    </nav>
  )
}
