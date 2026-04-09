export default function CTA() {
  return (
    <section id="cta" className="py-20 px-6 bg-bg-dark">
      <div className="max-w-[600px] mx-auto">
        <div className="glass-card-dark p-10 sm:p-14 text-center" style={{ boxShadow: '0 0 80px rgba(108, 92, 231, 0.12)' }}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-accent mb-3">Launch</p>
          <h2 className="text-[36px] sm:text-[44px] font-bold leading-[1.08] tracking-[-0.02em] text-white mb-4">
            Ready to get started?
          </h2>
          <div className="w-10 h-[3px] bg-gradient-to-r from-primary to-accent rounded-full mx-auto mb-6" />
          <p className="text-[16px] text-white/50 leading-[1.6] mb-8 max-w-[380px] mx-auto">
            Deploy your first AI employee today and see the difference.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#" className="w-full sm:w-auto text-center px-7 py-3 bg-primary hover:bg-primary-hover text-white text-[14px] font-medium rounded-full transition-colors">
              Build My AI Employee
            </a>
            <a href="#" className="text-[14px] text-white/40 hover:text-white/70 transition-colors">
              Contact Sales &rsaquo;
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
