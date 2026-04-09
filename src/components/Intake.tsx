import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Step {
  question: string
  subtitle?: string
  type: 'textarea' | 'input' | 'email' | 'options'
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
  { question: "What's your biggest pain point?", subtitle: 'Your AI employee will help solve this challenge.', type: 'textarea', placeholder: 'Describe your main challenge...', key: 'painPoint' },
  { question: 'How many employees do you currently have?', subtitle: 'This helps us understand your team size.', type: 'options', options: ['Just me', '2–10', '11–50', '51–200', '200+'], key: 'teamSize' },
  { question: "What's your budget for AI automation?", subtitle: 'This helps us tailor the perfect solution.', type: 'options', options: ['$500–$1,000/mo', '$1,000–$2,500/mo', '$2,500–$5,000/mo', '$5,000+/mo', 'Not sure yet'], key: 'budget' },
  { question: "What's your email?", subtitle: "We'll send your AI employee details here.", type: 'email', placeholder: 'you@company.com', key: 'email' },
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
      // Erase
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

export default function Intake() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentValue, setCurrentValue] = useState('')
  const [done, setDone] = useState(false)
  const [direction, setDirection] = useState(1)

  const current = STEPS[step]
  const total = STEPS.length

  const goNext = (value?: string) => {
    const val = value ?? currentValue.trim()
    if (!val) return
    const updated = { ...answers, [current.key]: val }
    setAnswers(updated)
    setCurrentValue('')
    setDirection(1)
    if (step < total - 1) setStep(step + 1)
    else setDone(true)
  }

  const goBack = () => {
    if (step > 0) {
      setDirection(-1)
      setCurrentValue(answers[STEPS[step - 1].key] || '')
      setStep(step - 1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && current.type !== 'textarea') {
      e.preventDefault()
      goNext()
    }
  }

  if (done) {
    return (
      <div className="w-full max-w-[580px] mx-auto mt-14">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-[20px] font-semibold text-[#1a1a2e] mb-1">You're all set, {answers.name}.</h3>
          <p className="text-[13px] text-[#64648C] mb-6">
            Details will be sent to <span className="text-[#1a1a2e] font-medium">{answers.email}</span>
          </p>
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
                    className="w-full bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl text-[15px] text-[#1a1a2e] placeholder-[#9595B5] px-5 py-4 resize-none focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all relative z-10"
                    style={showRotatingPlaceholder ? { background: 'transparent' } : undefined}
                  />
                  {showRotatingPlaceholder && (
                    <div className="absolute top-0 left-0 px-4 py-3 text-[14px] z-0 pointer-events-none">
                      <RotatingPlaceholder words={current.rotatingPlaceholders!} />
                    </div>
                  )}
                </div>
              )}

              {(current.type === 'input' || current.type === 'email') && (
                <input
                  type={current.type === 'email' ? 'email' : 'text'}
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
            </motion.div>
          </AnimatePresence>

          {current.type !== 'options' && (
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
                {step === total - 1 ? 'Submit' : 'Continue'}
              </button>
            </div>
          )}

          {current.type === 'options' && step > 0 && (
            <div className="mt-4">
              <button onClick={goBack} className="text-[13px] text-[#9595B5] hover:text-primary transition-colors">
                &lsaquo; Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
