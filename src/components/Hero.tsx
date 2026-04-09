import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Intake from './Intake'

const ROTATING_WORDS = ['24/7.', '365 days.', 'non-stop.', 'around the clock.']

export default function Hero() {
  const [wordIndex, setWordIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="pt-28 pb-16 px-6">
      <div className="max-w-[680px] mx-auto text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary mb-4">
          AI Workforce Platform
        </p>

        <h1 className="text-[44px] sm:text-[56px] font-bold leading-[1.05] tracking-[-0.03em] text-[#1a1a2e] mb-5">
          AI employees that work{' '}
          <span className="inline-block relative">
            <AnimatePresence mode="wait">
              <motion.span
                key={wordIndex}
                initial={{ y: 20, opacity: 0, filter: 'blur(4px)' }}
                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                exit={{ y: -20, opacity: 0, filter: 'blur(4px)' }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="inline-block gradient-text"
              >
                {ROTATING_WORDS[wordIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
        </h1>

        <p className="text-[17px] leading-[1.5] text-[#64648C] max-w-[480px] mx-auto mb-4">
          Deploy intelligent AI coworkers that handle your tasks around the clock. No breaks. No downtime. No overhead.
        </p>

        <a href="#cta" className="inline-block text-primary text-[14px] font-medium hover:underline mb-2">
          Learn more &rsaquo;
        </a>

        <Intake />
      </div>
    </section>
  )
}
