const steps = [
  { num: '01', title: 'Define the role.', desc: 'Tell us what you need — customer support, data entry, content writing, scheduling, or anything else.' },
  { num: '02', title: 'We configure it.', desc: 'Your AI employee gets trained on your specific workflows, tools, brand voice, and business rules.' },
  { num: '03', title: 'Deploy instantly.', desc: 'Your AI employee goes live in under 60 seconds and starts working immediately.' },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-6">
      <div className="max-w-[980px] mx-auto">
        <div className="text-center mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-3">Process</p>
          <h2 className="text-[36px] sm:text-[44px] font-bold leading-[1.08] tracking-[-0.02em] text-[#1a1a2e]">
            Three steps.<br />That's it.
          </h2>
          <div className="w-10 h-[3px] bg-gradient-to-r from-primary to-accent rounded-full mx-auto mt-4" />
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {steps.map((s) => (
            <div key={s.num} className="glass-card p-7 text-center">
              <span className="text-[48px] font-bold font-mono text-primary/10 leading-none block mb-2">{s.num}</span>
              <h3 className="text-[18px] font-semibold text-[#1a1a2e] mb-2">{s.title}</h3>
              <p className="text-[13px] text-[#64648C] leading-[1.6]">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
