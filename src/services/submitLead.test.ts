import { describe, expect, it } from 'vitest'
import type { LeadFormData, PreferredContact } from '../types/lead'
import { buildLeadMessage, buildLeadSubmissionUrl } from './submitLead'

const makeLead = (preferredContact: PreferredContact): LeadFormData => ({
  car: 'BMW 7',
  startDate: '2026-07-25',
  endDate: '2026-07-27',
  name: ' Алексей ',
  phone: ' +7 999 123-45-67 ',
  preferredContact,
  comment: ' Подача в аэропорт ',
  consent: true,
})

describe('lead submission', () => {
  it('builds a readable message from all form fields', () => {
    expect(buildLeadMessage(makeLead('telegram'))).toBe(
      [
        'Здравствуйте! Хочу узнать доступность автомобиля.',
        '',
        'Автомобиль: BMW 7',
        'Даты: 25.07.2026 — 27.07.2026',
        'Имя: Алексей',
        'Телефон: +7 999 123-45-67',
        'Канал отправки заявки: Telegram',
        'Комментарий: Подача в аэропорт',
      ].join('\n'),
    )
  })

  it('creates a WhatsApp link to the configured manager', () => {
    const lead = makeLead('whatsapp')
    const url = new URL(buildLeadSubmissionUrl(lead))

    expect(`${url.origin}${url.pathname}`).toBe('https://wa.me/79776341920')
    expect(url.searchParams.get('text')).toBe(buildLeadMessage(lead))
  })

  it('creates a Telegram link with the application text', () => {
    const lead = makeLead('telegram')
    const url = new URL(buildLeadSubmissionUrl(lead))

    expect(`${url.origin}${url.pathname}`).toBe('https://t.me/rentcar_krasnodar')
    expect(url.searchParams.get('text')).toBe(buildLeadMessage(lead))
  })

  it('creates an SMS link when messengers are unavailable', () => {
    const lead = makeLead('sms')
    const url = buildLeadSubmissionUrl(lead)

    expect(url).toBe(`sms:+79776341920?body=${encodeURIComponent(buildLeadMessage(lead))}`)
  })
})
