import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main className="page-shell">
      <motion.section
        className="hero-card"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <span className="eyebrow">Sprint 0</span>
        <h1>Hotel Maximos</h1>
        <p>
          Base frontend em React 19.2.1 com TanStack Start, SSR, TanStack Router,
          Query/Table, Zustand, Zod, shadcn/ui e Motion.
        </p>
      </motion.section>
    </main>
  )
}
