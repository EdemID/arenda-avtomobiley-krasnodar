export type PreferredContact = 'sms' | 'telegram' | 'whatsapp'

export interface LeadFormData {
  car: string
  startDate: string
  endDate: string
  name: string
  phone: string
  preferredContact: PreferredContact
  comment: string
  consent: boolean
}

export type LeadFormErrors = Partial<Record<keyof LeadFormData, string>>
