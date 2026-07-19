import { contactConfig } from '../config/contactConfig'
import type { LeadFormData, PreferredContact } from '../types/lead'

export const submissionChannels: Record<
  PreferredContact,
  { label: string; buttonLabel: string; successMessage: string }
> = {
  whatsapp: {
    label: 'WhatsApp',
    buttonLabel: 'Отправить в WhatsApp',
    successMessage: 'Заявка готова. В WhatsApp проверьте сообщение и нажмите «Отправить».',
  },
  telegram: {
    label: 'Telegram',
    buttonLabel: 'Отправить в Telegram',
    successMessage: 'Открываем Telegram. Текст заявки также скопирован — при необходимости вставьте его в сообщение.',
  },
  sms: {
    label: 'SMS',
    buttonLabel: 'Отправить по SMS',
    successMessage: 'Открываем приложение сообщений с готовой заявкой. Проверьте текст и отправьте SMS.',
  },
}

const formatDate = (value: string) => {
  const [year, month, day] = value.split('-')
  return `${day}.${month}.${year}`
}

export function buildLeadMessage(data: LeadFormData): string {
  const lines = [
    'Здравствуйте! Хочу узнать доступность автомобиля.',
    '',
    `Автомобиль: ${data.car}`,
    `Даты: ${formatDate(data.startDate)} — ${formatDate(data.endDate)}`,
    `Имя: ${data.name.trim()}`,
    `Телефон: ${data.phone.trim()}`,
    `Канал отправки заявки: ${submissionChannels[data.preferredContact].label}`,
  ]

  if (data.comment.trim()) lines.push(`Комментарий: ${data.comment.trim()}`)

  return lines.join('\n')
}

export function buildLeadSubmissionUrl(data: LeadFormData): string {
  const message = encodeURIComponent(buildLeadMessage(data))

  if (data.preferredContact === 'telegram') {
    return `${contactConfig.telegramUrl}?text=${message}`
  }

  if (data.preferredContact === 'sms') {
    return `sms:${contactConfig.smsPhone}?body=${message}`
  }

  return `${contactConfig.whatsappUrl}?text=${message}`
}
