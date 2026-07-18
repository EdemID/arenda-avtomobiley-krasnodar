import type { LeadFormData } from '../types/lead'

export async function submitLead(data: LeadFormData): Promise<{ message: string }> {
  const payload = { ...data, phone: data.phone.trim() }

  // TODO: подключить реальный API отправки заявки перед публикацией.
  if (import.meta.env.DEV) {
    await new Promise((resolve) => window.setTimeout(resolve, 700))
    return {
      message: 'Форма заполнена корректно. Для реальной отправки необходимо подключить API.',
    }
  }

  void payload
  return {
    message: 'Форма заполнена корректно. Для реальной отправки необходимо подключить API.',
  }
}
