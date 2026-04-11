export default function Footer() {
  return (
    <footer className="py-6 px-6 bg-bg-dark border-t border-white/5">
      <div className="max-w-[980px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[12px] text-white/30">
          &copy; {new Date().getFullYear()} CompletedBy. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <a href="#" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">Privacy</a>
          <a href="#" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">Terms</a>
          <a href="#" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  )
}
