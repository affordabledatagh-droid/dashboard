import { AgentRow } from './adminApi'

export interface TemplateContext { name: string; shop: string; balance: string; sinceText: string; profit: string }

export interface Template {
  id: string
  label: string
  hint: string
  build: (c: TemplateContext) => string
}

// Five check-in messages. {name} is the owner's first name when we have it, otherwise the shop name.
export const TEMPLATES: Template[] = [
  {
    id: 'checkin',
    label: "It's been a while",
    hint: 'Friendly nudge for quiet accounts',
    build: c => `Hi ${c.name}, it's been a while since we last heard from you on AffordableData. How have you been? Is there anything we can do to help you get going again?`,
  },
  {
    id: 'delivery',
    label: 'How is delivery?',
    hint: 'Ask about complaints and delayed orders',
    build: c => `Hi ${c.name}, this is AffordableData checking in. How has delivery been for your customers lately? Have you had any complaints or delayed orders? If so, send us the phone number and the bundle in text (not a screenshot) and we will sort it out quickly.`,
  },
  {
    id: 'lowbalance',
    label: 'Balance is low',
    hint: 'For active sellers whose wallet is running dry',
    build: c => `Hi ${c.name}, your AffordableData wallet balance is getting low (${c.balance}) and we don't want you to miss sales because of it. Is anything stopping you from topping up? If there is anything we can do to help, just tell us.`,
  },
  {
    id: 'nosales',
    label: "Haven't made sales",
    hint: 'Find out what is going wrong',
    build: c => `Hi ${c.name}, we noticed you haven't made any sales ${c.sinceText}. Is something going wrong? It could be the prices, finding customers, or something in the app. Tell us what is happening and we will help you start earning again.`,
  },
  {
    id: 'checkup',
    label: 'Checking up on you',
    hint: 'General, relationship-first check-in',
    build: c => `Hi ${c.name}, I'm reaching out from AffordableData just to check up on you. How is business going? We want you to earn more, so if you need anything (pricing tips, help getting customers, or a problem with the app), just reply here and we will help.`,
  },
]

const first = (s: string | null) => (s ?? '').trim().split(/\s+/)[0]

export function templateContext(a: AgentRow): TemplateContext {
  const days = a.inactiveDays
  return {
    name: first(a.name) || a.shopName,
    shop: a.shopName,
    balance: `GH₵${a.walletBalance.toFixed(2)}`,
    sinceText: days === null || days === undefined ? 'yet' : days <= 1 ? 'recently' : `in the last ${days} days`,
    profit: `GH₵${a.profit.toFixed(2)}`,
  }
}

/** Pre-select the message that fits the account's situation. */
export function suggestTemplate(a: AgentRow): string {
  if (a.lowBalance) return 'lowbalance'
  if (a.inactiveDays === null || a.inactiveDays === undefined) return 'nosales'
  if (a.inactiveDays > 30) return 'checkin'
  if (a.inactiveDays > 7) return 'nosales'
  return 'delivery'
}

export function whatsappLink(number: string | null, text: string): string | null {
  if (!number) return null
  let d = number.replace(/\D/g, '')
  if (d.startsWith('0')) d = '233' + d.slice(1)
  return d.length >= 11 ? `https://wa.me/${d}?text=${encodeURIComponent(text)}` : null
}
