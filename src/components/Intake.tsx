import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Step {
  question: string
  subtitle?: string
  type: 'textarea' | 'input' | 'email' | 'options' | 'multi-select'
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
  { question: "What's your budget for AI automation?", subtitle: 'This helps us tailor the perfect solution.', type: 'options', options: ['$500–$1,000/mo', '$1,000–$2,500/mo', '$2,500–$5,000/mo', '$5,000+/mo', 'Not sure yet'], key: 'budget' },
]

const GENERATING_LINES = [
  'Analyzing your requirements...',
  'Configuring AI capabilities...',
  'Training on your industry...',
  'Setting up integrations...',
  'Optimizing workflows...',
  'Finalizing your AI employee...',
]

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbzi8PgRRBCG6RJjM6qpdj8LYx7dJWSjotusLNkg2TMDKFF4EcLhFxjPSE1rszhSCeXZDw/exec'

// ---------- Helper functions for chat personalization ----------

const KNOWN_TOOLS = [
  'instagram', 'tiktok', 'canva', 'gmail', 'slack', 'hubspot', 'notion',
  'salesforce', 'airtable', 'shopify', 'google calendar', 'outlook',
  'facebook', 'linkedin', 'twitter', 'x.com', 'zapier', 'discord',
  'whatsapp', 'zoom', 'calendly', 'stripe', 'quickbooks', 'excel',
  'google sheets', 'google docs', 'trello', 'asana', 'monday',
]

function getToolsAck(toolsString: string): string {
  if (!toolsString) return "I'll adapt to your exact stack"
  const lower = toolsString.toLowerCase()
  const matched = KNOWN_TOOLS.filter((t) => lower.includes(t))
  if (matched.length === 0) return "I'll adapt to your exact stack — no problem"
  const nice = matched.slice(0, 3).map((t) => t.replace(/\b\w/g, (c) => c.toUpperCase()))
  if (matched.length === 1) return `${nice[0]} — fully supported, native integration`
  if (matched.length === 2) return `${nice[0]} and ${nice[1]} — both fully supported`
  return `${nice[0]}, ${nice[1]}, ${nice[2]} — all native integrations`
}

function getROI(teamSize: string): { hoursRange: string; fteEquivalent: string } {
  switch (teamSize) {
    case 'Just me':
      return { hoursRange: '20+ hours', fteEquivalent: 'half a full-time hire' }
    case '2–10':
      return { hoursRange: '40–60 hours', fteEquivalent: 'a full-time employee' }
    case '11–50':
      return { hoursRange: '150+ hours', fteEquivalent: '3 full-time employees' }
    case '51–200':
      return { hoursRange: '500+ hours', fteEquivalent: '10 full-time employees' }
    case '200+':
      return { hoursRange: '1,000+ hours', fteEquivalent: '20+ full-time employees' }
    default:
      return { hoursRange: 'significant hours', fteEquivalent: 'multiple hires' }
  }
}

function getFirstPainPoint(painPointsString: string): string {
  if (!painPointsString) return ''
  return painPointsString.split(',')[0].trim().toLowerCase()
}

function postToSheet(payload: Record<string, unknown>) {
  // Fire-and-forget
  try {
    fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    }).catch((e) => console.error('Submission failed:', e))
  } catch (err) {
    console.error('Submission failed:', err)
  }
}

// ---------- Animated typing placeholder (existing) ----------

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

// ---------- Generating screen (existing) ----------

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
      <div className="w-16 h-16 mx-auto mb-6 relative">
        <div className="absolute inset-0 rounded-full border-2 border-primary/10" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
      </div>

      <h3 className="text-[20px] sm:text-[22px] font-semibold text-[#1a1a2e] mb-6">
        Building your AI employee...
      </h3>

      <div className="w-full h-1.5 bg-white/30 rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

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

// ---------- Chat screen (JARVIS-style) ----------

type Sender = 'bot' | 'user'
interface ChatMessage {
  id: number
  sender: Sender
  text: string
}

type ChatStage =
  | 'greeting'
  | 'acknowledge'
  | 'industry'
  | 'roi'
  | 'awaitingPlanClick'
  | 'emailRequest'
  | 'awaitingEmail'
  | 'emailConfirm'
  | 'callAsk'
  | 'awaitingCallChoice'
  | 'final'
  | 'done'

interface ChatScreenProps {
  answers: Record<string, string>
  onComplete: (email: string, wantsCall: boolean) => void
}

function ChatScreen({ answers, onComplete }: ChatScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [stage, setStage] = useState<ChatStage>('greeting')
  const [isTyping, setIsTyping] = useState(false)
  const [email, setEmail] = useState('')
  const [emailSubmitting, setEmailSubmitting] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const idCounter = useRef(0)

  const nextId = () => {
    idCounter.current += 1
    return idCounter.current
  }

  const addBotMessage = (text: string, delay = 1200) => {
    return new Promise<void>((resolve) => {
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        setMessages((prev) => [...prev, { id: nextId(), sender: 'bot', text }])
        setTimeout(resolve, 300)
      }, delay)
    })
  }

  const addUserMessage = (text: string) => {
    setMessages((prev) => [...prev, { id: nextId(), sender: 'user', text }])
  }

  // Auto-scroll on new message / typing indicator
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // State machine driver — queues bot messages automatically
  useEffect(() => {
    let cancelled = false
    async function run() {
      if (stage === 'greeting') {
        await addBotMessage(`Analysis complete, ${answers.name || 'there'}. 👋`, 800)
        if (!cancelled) setStage('acknowledge')
      } else if (stage === 'acknowledge') {
        const task = (answers.task || '').trim()
        const toolsAck = getToolsAck(answers.tools || '')
        const taskLine = task
          ? `You want me to ${task.toLowerCase().replace(/\.$/, '')}.`
          : `I've reviewed your requirements.`
        await addBotMessage(`${taskLine} I've scanned the tools you mentioned — ${toolsAck}.`)
        if (!cancelled) setStage('industry')
      } else if (stage === 'industry') {
        const industry = (answers.industry || '').trim()
        const firstPain = getFirstPainPoint(answers.painPoints || '')
        let line = ''
        if (industry && firstPain) {
          line = `You're in ${industry}, and your biggest challenge is "${firstPain}". That's literally what I was built for.`
        } else if (industry) {
          line = `You're in ${industry} — I've been trained on that space extensively.`
        } else if (firstPain) {
          line = `Your biggest challenge is "${firstPain}". That's literally what I was built for.`
        } else {
          line = `I've got a clear picture of what you need.`
        }
        await addBotMessage(line)
        if (!cancelled) setStage('roi')
      } else if (stage === 'roi') {
        const { hoursRange, fteEquivalent } = getROI(answers.teamSize || '')
        await addBotMessage(
          `Based on a ${answers.teamSize || 'team'} operation, I can save you roughly ${hoursRange} per week — that's equivalent to ${fteEquivalent}, without the hiring cost.`
        )
        if (!cancelled) setStage('awaitingPlanClick')
      } else if (stage === 'emailRequest') {
        await addBotMessage(
          `Drop your email and I'll send your full deployment plan right now.`,
          900
        )
        if (!cancelled) setStage('awaitingEmail')
      } else if (stage === 'emailConfirm') {
        await addBotMessage(`Got it. Sending now to ${email}. ✉️`, 700)
        if (!cancelled) setStage('callAsk')
      } else if (stage === 'callAsk') {
        await addBotMessage(
          `Want to jump on a 15-min call so I can go live in your business today? No prep needed — I already have everything.`,
          1200
        )
        if (!cancelled) setStage('awaitingCallChoice')
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [stage])

  const handlePlanClick = () => {
    addUserMessage('Show me my deployment plan')
    setStage('emailRequest')
  }

  const handleEmailSubmit = () => {
    if (!email.trim() || emailSubmitting) return
    setEmailSubmitting(true)
    const trimmed = email.trim()
    addUserMessage(trimmed)

    // Fire initial POST with wantsCall = pending
    postToSheet({ ...answers, email: trimmed, wantsCall: null })

    setStage('emailConfirm')
  }

  const handleCallChoice = (wantsCall: boolean) => {
    const text = wantsCall ? 'Yes, book a call' : 'Maybe later'
    addUserMessage(text)

    // Re-POST with the final wantsCall decision
    postToSheet({ ...answers, email, wantsCall })

    ;(async () => {
      const finalLine = wantsCall
        ? `Perfect. We'll send a calendar link to ${email} within the hour.`
        : `No problem. Check your inbox at ${email} — everything you need is there.`
      await addBotMessage(finalLine, 1000)
      setTimeout(() => onComplete(email, wantsCall), 1800)
    })()

    setStage('final')
  }

  return (
    <div className="w-full max-w-[580px] mx-auto mt-14">
      <div className="glass-card overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/40 bg-white/20 text-left">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
            <span className="text-white text-[14px]">✨</span>
          </div>
          <div>
            <div className="text-[14px] font-semibold text-[#1a1a2e] leading-tight">Your AI Employee</div>
            <div className="text-[11px] text-[#64648C] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              online · ready
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="p-5 space-y-3 max-h-[420px] overflow-y-auto"
        >
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={
                    m.sender === 'bot'
                      ? 'bg-white/80 border border-white/60 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%] text-[14px] text-[#1a1a2e] leading-[1.5] shadow-sm text-left'
                      : 'bg-primary text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%] text-[14px] leading-[1.5] text-left'
                  }
                >
                  {m.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white/80 border border-white/60 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Interactive footer — changes based on stage */}
        <div className="px-5 pb-5 pt-1">
          {stage === 'awaitingPlanClick' && !isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-2"
            >
              <button
                onClick={handlePlanClick}
                className="px-5 py-2.5 rounded-full text-[13px] font-medium bg-primary text-white hover:bg-primary-hover transition-colors"
              >
                Show me my deployment plan →
              </button>
            </motion.div>
          )}

          {stage === 'awaitingEmail' && !isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex gap-2"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEmailSubmit()
                }}
                placeholder="you@company.com"
                autoFocus
                disabled={emailSubmitting}
                className="flex-1 bg-white/60 backdrop-blur-sm border border-white/40 rounded-full text-[14px] text-[#1a1a2e] placeholder-[#9595B5] px-4 py-2.5 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
              />
              <button
                onClick={handleEmailSubmit}
                disabled={!email.trim() || emailSubmitting}
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-[13px] font-medium rounded-full transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </motion.div>
          )}

          {stage === 'awaitingCallChoice' && !isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-2"
            >
              <button
                onClick={() => handleCallChoice(true)}
                className="px-5 py-2.5 rounded-full text-[13px] font-medium bg-primary text-white hover:bg-primary-hover transition-colors"
              >
                Yes, book a call
              </button>
              <button
                onClick={() => handleCallChoice(false)}
                className="px-5 py-2.5 rounded-full text-[13px] font-medium bg-white/60 backdrop-blur-sm border border-white/40 text-[#1a1a2e] hover:bg-white/80 transition-colors"
              >
                Maybe later
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------- Main Intake component ----------

export default function Intake() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentValue, setCurrentValue] = useState('')
  const [selectedMulti, setSelectedMulti] = useState<string[]>([])
  const [direction, setDirection] = useState(1)
  const [phase, setPhase] = useState<'questions' | 'generating' | 'chat' | 'done'>('questions')
  const [finalEmail, setFinalEmail] = useState('')
  const [finalWantsCall, setFinalWantsCall] = useState(false)

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

  const handleChatComplete = (email: string, wantsCall: boolean) => {
    setFinalEmail(email)
    setFinalWantsCall(wantsCall)
    setPhase('done')
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
          <p className="text-[13px] text-[#64648C] mb-2">
            Your AI employee profile has been sent to <span className="text-[#1a1a2e] font-medium">{finalEmail}</span>
          </p>
          {finalWantsCall && (
            <p className="text-[13px] text-primary font-medium mb-6">
              We'll reach out within the hour to book your deployment call.
            </p>
          )}
          {!finalWantsCall && <div className="mb-6" />}
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

  // GENERATING screen
  if (phase === 'generating') {
    return (
      <div className="w-full max-w-[580px] mx-auto mt-14">
        <div className="glass-card overflow-hidden p-7 sm:p-10">
          <GeneratingScreen onComplete={() => setPhase('chat')} />
        </div>
      </div>
    )
  }

  // CHAT screen (JARVIS)
  if (phase === 'chat') {
    return <ChatScreen answers={answers} onComplete={handleChatComplete} />
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
          {(current.type === 'textarea' || current.type === 'input' || current.type === 'email') && (
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
