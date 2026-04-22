export default function CTA() {
  return (
    <section id="cta" className="py-20 px-6 bg-bg-dark">
      <div className="max-w-[980px] mx-auto">
        <div className="glass-card-dark p-10 sm:p-14 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8" style={{ boxShadow: '0 0 80px rgba(108, 92, 231, 0.12)' }}>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-accent mb-3">Launch</p>
            <h2 className="text-[32px] sm:text-[40px] font-bold leading-[1.08] tracking-[-0.02em] text-white mb-3">
              Ready to get started?
            </h2>
            <p className="text-[15px] text-white/50 leading-[1.6] max-w-[380px]">
              Deploy your first AI employee today and see the difference.
            </p>
          </div>
          <div className="flex flex-col gap-3 shrink-0">
            <a href="#intake" className="text-center px-7 py-3 bg-primary hover:bg-primary-hover text-white text-[14px] font-medium rounded-full transition-colors">
              Build My AI Employee
            </a>
            <a href="#intake" className="text-center text-[14px] text-white/40 hover:text-white/70 transition-colors">
              Contact Sales &rsaquo;
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
