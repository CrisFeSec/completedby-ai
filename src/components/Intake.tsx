import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Step {
  question: string
  subtitle?: string
  type: 'textarea' | 'input' | 'email' | 'tel' | 'options' | 'multi-select'
  placeholder?: string
  options?: string[]
  key: string
  rotatingPlaceholders?: string[]
}

const STEPS: Step[] = [
  {
    question: 'What do you want your AI employee to do?',
    type: 'textarea',
    placeholder: '',
    key: 'task',
    rotatingPlaceholders: [
      'Post on social media',
      'Answer customer emails',
      'Schedule appointments',
      'Write blog content',
      'Manage my CRM',
      'Handle data entry',
    ],
  },
  { question: 'What tools does this employee need?', type: 'textarea', placeholder: 'Instagram, TikTok, Canva...', key: 'tools' },
  { question: 'What should your employee call you?', type: 'input', placeholder: 'Your first name', key: 'name' },
  { question: 'What industry are you in?', subtitle: 'This helps your AI employee understand your business context.', type: 'input', placeholder: 'e.g. Real Estate, E-commerce...', key: 'industry' },
  {
    question: "What are your biggest pain points?",
    subtitle: 'Select all that apply. Your AI employee will tackle these first.',
    type: 'multi-select',
    options: [
      'Too many repetitive tasks',
      'Not enough hours in the day',
      'Hiring is too expensive',
      'Inconsistent work quality',
      'Slow response times',
      'Scaling without adding headcount',
      'Data entry & admin overload',
      'Content creation bottleneck',
    ],
    key: 'painPoints',
  },
  { question: 'How many employees do you currently have?', subtitle: 'This helps us understand your team size.', type: 'options', options: ['Just me', '2–10', '11–50', '51–200', '200+'], key: 'teamSize' },
]

const GENERATING_LINES = [
  'Analyzing your requirements...',
  'Configuring AI capabilities...',
  'Training on your industry...',
  'Setting up integrations...',
  'Optimizing workflows...',
  'Finalizing your AI employee...',
]

function RotatingPlaceholder({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    const word = words[index]
    let charIndex = 0
    let timeout: ReturnType<typeof setTimeout>

    if (isTyping) {
      timeout = setTimeout(function type() {
        if (charIndex <= word.length) {
          setDisplayText(word.slice(0, charIndex))
          charIndex++
          timeout = setTimeout(type, 60 + Math.random() * 40)
        } else {
          timeout = setTimeout(() => setIsTyping(false), 1800)
        }
      }, 100)
    } else {
      let len = displayText.length
      timeout = setTimeout(function erase() {
        if (len > 0) {
          len--
          setDisplayText(words[index].slice(0, len))
          timeout = setTimeout(erase, 30)
        } else {
          setIndex((prev) => (prev + 1) % words.length)
          setIsTyping(true)
        }
      }, 30)
    }

    return () => clearTimeout(timeout)
  }, [index, isTyping])

  return (
    <span className="text-[#64648C] pointer-events-none select-none">
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  )
}

function GeneratingScreen({ onComplete }: { onComplete: () => void }) {
  const [lineIndex, setLineIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const lineInterval = setInterval(() => {
      setLineIndex((prev) => {
        if (prev >= GENERATING_LINES.length - 1) {
          clearInterval(lineInterval)
          return prev
        }
        return prev + 1
      })
    }, 300)

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 5
      })
    }, 40)

    const doneTimeout = setTimeout(() => {
      onComplete()
    }, 2000)

    return () => {
      clearInterval(lineInterval)
      clearInterval(progressInterval)
      clearTimeout(doneTimeout)
    }
  }, [onComplete])

  return (
    <div className="py-8 text-center">
      {/* Spinner */}
      <div className="w-16 h-16 mx-auto mb-6 relative">
        <div className="absolute inset-0 rounded-full border-2 border-primary/10" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
      </div>

      <h3 className="text-[20px] sm:text-[22px] font-semibold text-[#1a1a2e] mb-6">
        Building your AI employee...
      </h3>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-white/30 rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Status lines */}
      <div className="space-y-2 min-h-[120px]">
        {GENERATING_LINES.slice(0, lineIndex + 1).map((line, i) => (
          <motion.div
            key={line}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: i === lineIndex ? 1 : 0.4, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 justify-center text-[13px]"
          >
            {i < lineIndex ? (
              <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              </div>
            )}
            <span className={i < lineIndex ? 'text-[#9595B5]' : 'text-[#1a1a2e]'}>{line}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (opts: { url: string; parentElement: HTMLElement; prefill?: Record<string, unknown> }) => void
    }
  }
}

function BookScreen({ email, onBooked, onSkip }: { email: string; onBooked: () => void; onSkip: () => void }) {
  const widgetRef = useRef<HTMLDivElement>(null)

  // Listen for Calendly's "event_scheduled" postMessage
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (typeof e.data !== 'object' || !e.data) return
      const evt = (e.data as { event?: string }).event
      if (evt === 'calendly.event_scheduled') {
        onBooked()
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [onBooked])

  // Initialize the Calendly widget when the script is ready
  useEffect(() => {
    const calendlyUrl = 'https://calendly.com/jeremybishop/completedby-onboarding?hide_gdpr_banner=1'

    const init = () => {
      if (!widgetRef.current) return
      if (window.Calendly) {
        // Clear any prior render
        widgetRef.current.innerHTML = ''
        window.Calendly.initInlineWidget({
          url: calendlyUrl,
          parentElement: widgetRef.current,
          prefill: { email },
        })
      }
    }

    if (window.Calendly) {
      init()
    } else {
      // Script still loading – poll briefly
      const interval = setInterval(() => {
        if (window.Calendly) {
          init()
          clearInterval(interval)
        }
      }, 100)
      const timeout = setTimeout(() => clearInterval(interval), 5000)
      return () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }
    }
  }, [email])

  return (
    <div className="w-full max-w-[720px] mx-auto mt-14">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card overflow-hidden"
      >
        <div className="p-6 sm:p-8 text-center border-b border-white/40">
          <h3 className="text-[20px] sm:text-[22px] font-bold text-[#1a1a2e] mb-1.5">
            Last step — book your deployment call.
          </h3>
          <p className="text-[13px] text-[#64648C]">
            Pick a time and we'll walk you through your custom AI employee setup.
          </p>
        </div>
        <div
          ref={widgetRef}
          style={{ minWidth: '320px', height: '700px' }}
        />
        <div className="p-4 text-center border-t border-white/40">
          <button
            onClick={onSkip}
            className="text-[13px] text-[#9595B5] hover:text-primary transition-colors"
          >
            Skip for now &rsaquo;
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function Intake() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentValue, setCurrentValue] = useState('')
  const [selectedMulti, setSelectedMulti] = useState<string[]>([])
  const [direction, setDirection] = useState(1)
  const [phase, setPhase] = useState<'questions' | 'generating' | 'ready' | 'book' | 'done'>('questions')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [booked, setBooked] = useState(false)

  const current = STEPS[step]
  const total = STEPS.length

  const goNext = (value?: string) => {
    const val = value ?? currentValue.trim()
    if (!val) return
    const updated = { ...answers, [current.key]: val }
    setAnswers(updated)
    setCurrentValue('')
    setDirection(1)
    if (step < total - 1) {
      setStep(step + 1)
    } else {
      // Last question answered → go to generating
      setPhase('generating')
    }
  }

  const goNextMulti = () => {
    if (selectedMulti.length === 0) return
    const updated = { ...answers, [current.key]: selectedMulti.join(', ') }
    setAnswers(updated)
    setSelectedMulti([])
    setDirection(1)
    if (step < total - 1) {
      setStep(step + 1)
    } else {
      setPhase('generating')
    }
  }

  const toggleMulti = (opt: string) => {
    setSelectedMulti((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
    )
  }

  const goBack = () => {
    if (step > 0) {
      setDirection(-1)
      setCurrentValue(answers[STEPS[step - 1].key] || '')
      setStep(step - 1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && current.type !== 'textarea' && current.type !== 'multi-select') {
      e.preventDefault()
      goNext()
    }
  }

  const handleContactSubmit = async () => {
    if (!email.trim() || !phone.trim()) return
    const trimmedEmail = email.trim()
    const trimmedPhone = phone.trim()
    setAnswers((prev) => ({ ...prev, email: trimmedEmail, phone: trimmedPhone }))
    setPhase('book')

    // Fire-and-forget POST to Google Sheets (initial submission, booked=false)
    const payload = { ...answers, email: trimmedEmail, phone: trimmedPhone, booked: false }
    try {
      await fetch(
        'https://script.google.com/macros/s/AKfycbzi8PgRRBCG6RJjM6qpdj8LYx7dJWSjotusLNkg2TMDKFF4EcLhFxjPSE1rszhSCeXZDw/exec',
        {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        }
      )
    } catch (err) {
      console.error('Submission failed:', err)
    }
  }

  const recordBooking = async () => {
    setBooked(true)
    const payload = { ...answers, email, phone, booked: true }
    try {
      await fetch(
        'https://script.google.com/macros/s/AKfycbzi8PgRRBCG6RJjM6qpdj8LYx7dJWSjotusLNkg2TMDKFF4EcLhFxjPSE1rszhSCeXZDw/exec',
        {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        }
      )
    } catch (err) {
      console.error('Booking update failed:', err)
    }
  }

  // DONE screen
  if (phase === 'done') {
    return (
      <div className="w-full max-w-[580px] mx-auto mt-14">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-[20px] font-semibold text-[#1a1a2e] mb-1">You're all set, {answers.name}.</h3>
          {booked ? (
            <p className="text-[13px] text-[#64648C] mb-6">
              Your demo is booked. We'll see you soon — confirmation sent to <span className="text-[#1a1a2e] font-medium">{answers.email}</span>.
            </p>
          ) : (
            <p className="text-[13px] text-[#64648C] mb-6">
              Your AI employee profile has been sent to <span className="text-[#1a1a2e] font-medium">{answers.email}</span>. We'll be in touch shortly.
            </p>
          )}
          <div className="grid grid-cols-2 gap-4 text-left bg-white/30 backdrop-blur-sm rounded-xl p-5 border border-white/40">
            {[
              { label: 'Task', value: answers.task },
              { label: 'Tools', value: answers.tools },
              { label: 'Industry', value: answers.industry },
              { label: 'Team', value: answers.teamSize },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-[10px] font-mono font-bold text-primary uppercase tracking-wider">{item.label}</div>
                <div className="text-[13px] text-[#1a1a2e] mt-0.5 truncate">{item.value}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  // BOOK screen (Calendly embed)
  if (phase === 'book') {
    return <BookScreen email={email} onBooked={async () => { await recordBooking(); setPhase('done') }} onSkip={() => setPhase('done')} />
  }

  // GENERATING screen
  if (phase === 'generating') {
    return (
      <div className="w-full max-w-[580px] mx-auto mt-14">
        <div className="glass-card overflow-hidden p-7 sm:p-10">
          <GeneratingScreen onComplete={() => setPhase('ready')} />
        </div>
      </div>
    )
  }

  // READY screen (email collection)
  if (phase === 'ready') {
    const canSubmit = email.trim().length > 0 && phone.trim().length > 0
    return (
      <div className="w-full max-w-[580px] mx-auto mt-14">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="glass-card overflow-hidden p-7 sm:p-10 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-[22px] sm:text-[24px] font-bold text-[#1a1a2e] mb-2">
            Your custom AI employee is ready.
          </h3>
          <p className="text-[14px] text-[#64648C] mb-6">
            Drop your email and phone — we'll send your AI employee profile and your employee will text you for confirmations and quick check-ins.
          </p>
          <div className="flex flex-col gap-3 max-w-[420px] mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && canSubmit) handleContactSubmit() }}
              placeholder="you@company.com"
              autoComplete="email"
              autoFocus
              className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl text-[15px] text-[#1a1a2e] placeholder-[#9595B5] px-5 py-3.5 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
            />
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && canSubmit) handleContactSubmit() }}
              placeholder="+1 (555) 123-4567"
              className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl text-[15px] text-[#1a1a2e] placeholder-[#9595B5] px-5 py-3.5 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
            />
            <button
              onClick={handleContactSubmit}
              disabled={!canSubmit}
              className="px-6 py-3.5 bg-primary hover:bg-primary-hover text-white text-[14px] font-medium rounded-xl transition-colors disabled:opacity-25 disabled:cursor-not-allowed mt-1"
            >
              Send
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // QUESTIONS flow
  const showRotatingPlaceholder = step === 0 && !currentValue && current.rotatingPlaceholders

  return (
    <div className="w-full max-w-[580px] mx-auto mt-14">
      <div className="glass-card overflow-hidden">
        <div className="h-[3px] bg-white/20">
          <div className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500" style={{ width: `${((step + 1) / total) * 100}%` }} />
        </div>

        <div className="p-7 sm:p-10">
          <div className="text-[11px] font-mono text-[#9595B5] mb-5">Step {step + 1} of {total}</div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction * 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -15 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-[20px] sm:text-[22px] font-semibold text-[#1a1a2e] leading-snug mb-1.5">{current.question}</h3>
              {current.subtitle && <p className="text-[13px] text-[#9595B5] mb-5">{current.subtitle}</p>}
              {!current.subtitle && <div className="mb-5" />}

              {current.type === 'textarea' && (
                <div className="relative">
                  <textarea
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    placeholder={current.rotatingPlaceholders ? '' : current.placeholder}
                    rows={3}
                    className="w-full bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl text-[15px] text-[#1a1a2e] placeholder-[#9595B5] px-5 py-4 resize-none focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                  {showRotatingPlaceholder && (
                    <div className="absolute top-0 left-0 px-5 py-4 text-[15px] pointer-events-none">
                      <RotatingPlaceholder words={current.rotatingPlaceholders!} />
                    </div>
                  )}
                </div>
              )}

              {(current.type === 'input' || current.type === 'email' || current.type === 'tel') && (
                <input
                  type={current.type === 'email' ? 'email' : current.type === 'tel' ? 'tel' : 'text'}
                  inputMode={current.type === 'tel' ? 'tel' : undefined}
                  autoComplete={current.type === 'tel' ? 'tel' : current.type === 'email' ? 'email' : undefined}
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={current.placeholder}
                  className="w-full bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl text-[15px] text-[#1a1a2e] placeholder-[#9595B5] px-5 py-4 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                />
              )}

              {current.type === 'options' && (
                <div className="grid gap-2">
                  {current.options!.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => goNext(opt)}
                      className="w-full text-left px-5 py-3.5 rounded-xl text-[15px] text-[#1a1a2e] bg-white/60 backdrop-blur-sm border border-white/40 hover:border-primary/40 hover:text-primary hover:bg-white/80 transition-all"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {current.type === 'multi-select' && (
                <div className="grid grid-cols-2 gap-2">
                  {current.options!.map((opt) => {
                    const selected = selectedMulti.includes(opt)
                    return (
                      <button
                        key={opt}
                        onClick={() => toggleMulti(opt)}
                        className={`text-left px-4 py-3 rounded-xl text-[13px] border transition-all ${
                          selected
                            ? 'bg-primary/10 border-primary/30 text-primary font-medium'
                            : 'bg-white/60 backdrop-blur-sm border-white/40 text-[#1a1a2e] hover:border-primary/20 hover:bg-white/80'
                        }`}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Actions for textarea / input */}
          {(current.type === 'textarea' || current.type === 'input' || current.type === 'email' || current.type === 'tel') && (
            <div className="flex items-center justify-between mt-4">
              <div>
                {step > 0 && (
                  <button onClick={goBack} className="text-[13px] text-[#9595B5] hover:text-primary transition-colors">
                    &lsaquo; Back
                  </button>
                )}
              </div>
              <button
                onClick={() => goNext()}
                disabled={!currentValue.trim()}
                className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-[13px] font-medium rounded-full transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}

          {/* Actions for single-select options */}
          {current.type === 'options' && step > 0 && (
            <div className="mt-4">
              <button onClick={goBack} className="text-[13px] text-[#9595B5] hover:text-primary transition-colors">
                &lsaquo; Back
              </button>
            </div>
          )}

          {/* Actions for multi-select */}
          {current.type === 'multi-select' && (
            <div className="flex items-center justify-between mt-4">
              <div>
                {step > 0 && (
                  <button onClick={goBack} className="text-[13px] text-[#9595B5] hover:text-primary transition-colors">
                    &lsaquo; Back
                  </button>
                )}
              </div>
              <button
                onClick={goNextMulti}
                disabled={selectedMulti.length === 0}
                className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-[13px] font-medium rounded-full transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
