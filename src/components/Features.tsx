const features = [
  { num: '01', title: '24/7 Operations', desc: 'Your AI employees never clock out. They work through nights, weekends, and holidays without breaks.' },
  { num: '02', title: 'Instant Deployment', desc: 'Go from configuration to production in under 60 seconds. No onboarding. Just instant results.' },
  { num: '03', title: 'Fully Customizable', desc: 'Train on your workflows, brand voice, and business rules. They adapt to exactly how you operate.' },
  { num: '04', title: 'Seamless Integration', desc: 'Connects with Slack, email, CRM, databases — they work wherever you work.' },
]

export default function Features() {
  return (
    <section id="features" className="py-20 px-6">
      <div className="max-w-[980px] mx-auto">
        <div className="text-center mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-3">Capabilities</p>
          <h2 className="text-[36px] sm:text-[44px] font-bold leading-[1.08] tracking-[-0.02em] text-[#1a1a2e]">
            Get to know what<br />your AI can do.
          </h2>
          <div className="w-10 h-[3px] bg-gradient-to-r from-primary to-accent rounded-full mx-auto mt-4" />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {features.map((f) => (
            <div key={f.title} className="glass-card p-7 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
              <span className="text-[12px] font-mono font-bold text-primary mb-2 block">{f.num}</span>
              <h3 className="text-[18px] font-semibold text-[#1a1a2e] mb-2">{f.title}</h3>
              <p className="text-[14px] text-[#64648C] leading-[1.6]">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
