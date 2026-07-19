import {
  CalendarCheck,
  CalendarDays,
  CarFront,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleArrowUp,
  Clock3,
  MapPin,
  Menu,
  MessageCircle,
  MessageSquareText,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import {
  type Dispatch,
  type FormEvent,
  type KeyboardEvent,
  type SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import './App.css'
import { contactConfig } from './config/contactConfig'
import {
  benefits,
  cars,
  faqItems,
  heroBenefits,
  initialLeadFormData,
  navItems,
  rentalSteps,
  type CarItem,
} from './data/content'
import { buildLeadMessage, buildLeadSubmissionUrl, submissionChannels } from './services/submitLead'
import type { LeadFormData, LeadFormErrors, PreferredContact } from './types/lead'

const formCarOptions = [...cars.map((car) => car.shortName), 'Помогите выбрать']
const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedCar, setSelectedCar] = useState<CarItem | null>(null)
  const [requestedCar, setRequestedCar] = useState(initialLeadFormData.car)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [consentOpen, setConsentOpen] = useState(false)
  const [returnFocus, setReturnFocus] = useState<HTMLElement | null>(null)

  const lockScroll = menuOpen || selectedCar !== null || privacyOpen || consentOpen

  useEffect(() => {
    document.body.classList.toggle('scroll-locked', lockScroll)
    return () => document.body.classList.remove('scroll-locked')
  }, [lockScroll])

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setMenuOpen(false)
      setSelectedCar(null)
      setPrivacyOpen(false)
      setConsentOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!selectedCar && !privacyOpen && !consentOpen && returnFocus) {
      returnFocus.focus()
      setReturnFocus(null)
    }
  }, [consentOpen, privacyOpen, returnFocus, selectedCar])

  const openCar = (car: CarItem, opener: HTMLElement) => {
    setReturnFocus(opener)
    setSelectedCar(car)
  }

  const openInfoModal = (modal: 'privacy' | 'consent', opener: HTMLElement) => {
    setReturnFocus(opener)
    if (modal === 'privacy') setPrivacyOpen(true)
    if (modal === 'consent') setConsentOpen(true)
  }

  const chooseCar = (car: CarItem) => {
    setRequestedCar(car.shortName)
    setSelectedCar(null)
    window.setTimeout(() => document.querySelector('#availability')?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Перейти к основному содержанию
      </a>
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main id="main">
        <Hero />
        <Fleet onOpenCar={openCar} />
        <Benefits />
        <RentalProcess />
        <AvailabilityForm preferredCar={requestedCar} onOpenLegal={openInfoModal} />
        <FAQ />
        <Contacts />
        <FinalCTA />
      </main>
      <Footer onOpenLegal={openInfoModal} />
      <BottomActions />
      <BackToTopButton />

      {selectedCar ? (
        <CarModal car={selectedCar} onClose={() => setSelectedCar(null)} onChoose={() => chooseCar(selectedCar)} />
      ) : null}

      {privacyOpen ? (
        <LegalModal title="Политика конфиденциальности" onClose={() => setPrivacyOpen(false)}>
          <p>
            Данные из формы используются только для ответа на запрос об аренде автомобиля. Мы не
            публикуем и не передаём их сторонним организациям для рекламных рассылок.
          </p>
          <p>
            Заявка отправляется через WhatsApp. Обработка сообщения также регулируется условиями и
            политикой конфиденциальности этого сервиса.
          </p>
          <p>
            Уточнить порядок обработки или попросить удалить обращение можно по телефону{' '}
            <a href={contactConfig.phoneHref}>{contactConfig.phone}</a> или в Telegram.
          </p>
        </LegalModal>
      ) : null}

      {consentOpen ? (
        <LegalModal title="Согласие на обработку данных" onClose={() => setConsentOpen(false)}>
          <p>
            Отправляя форму, пользователь разрешает использовать указанные имя, телефон, даты и
            комментарий для связи по вопросу аренды выбранного автомобиля.
          </p>
          <p>
            Согласие действует до завершения обработки обращения и может быть отозвано сообщением в
            Telegram или WhatsApp.
          </p>
        </LegalModal>
      ) : null}
    </>
  )
}

interface HeaderProps {
  menuOpen: boolean
  setMenuOpen: Dispatch<SetStateAction<boolean>>
}

function Header({ menuOpen, setMenuOpen }: HeaderProps) {
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!menuOpen) return

    const onPointerDown = (event: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) setMenuOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [menuOpen, setMenuOpen])

  return (
    <header className="site-header" ref={headerRef}>
      <div className="container header-inner">
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <a className="logo" href="#top" aria-label="Аренда автомобилей Краснодар">
          <span>Аренда автомобилей</span>
          <strong>Краснодар</strong>
        </a>
        <nav className="desktop-nav" aria-label="Основная навигация">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <a className="button button-primary header-cta" href="#availability">
          <CalendarCheck aria-hidden="true" size={18} />
          Проверить даты
        </a>
      </div>
      <div id="mobile-menu" className={`mobile-menu ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
        <nav aria-label="Мобильная навигация">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
              {item.label}
            </a>
          ))}
          <a className="button button-primary" href="#availability" onClick={() => setMenuOpen(false)}>
            <CalendarCheck aria-hidden="true" size={18} />
            Проверить даты
          </a>
        </nav>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section id="top" className="hero-section section">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Премиальная аренда BMW в Краснодаре</p>
          <h1>Аренда премиальных автомобилей в Краснодаре</h1>
          <p className="hero-text">
            Выберите одну из четырёх актуальных моделей, посмотрите все фотографии и отправьте даты
            менеджеру прямо из формы.
          </p>
          <ul className="hero-benefits" aria-label="Ключевые преимущества">
            {heroBenefits.map((item) => (
              <li key={item}>
                <Check aria-hidden="true" size={18} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="hero-actions">
            <a className="button button-primary" href="#cars">
              <CarFront aria-hidden="true" size={19} />
              Выбрать автомобиль
            </a>
            <a className="button button-secondary" href={contactConfig.telegramUrl} target="_blank" rel="noreferrer">
              <Send aria-hidden="true" size={18} />
              Написать в Telegram
            </a>
          </div>
        </div>
        <figure className="hero-media">
          <img
            src={assetUrl('/images/cars/black-x6-hero.jpg')}
            width="1320"
            height="889"
            alt="Чёрный BMW X6 xDrive30D"
            fetchPriority="high"
          />
          <figcaption>
            <Sparkles aria-hidden="true" size={17} />
            <span>Четыре актуальных BMW — фотографии каждой машины внутри карточки</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}

function Fleet({ onOpenCar }: { onOpenCar: (car: CarItem, opener: HTMLElement) => void }) {
  return (
    <section id="cars" className="section fleet-section">
      <div className="container section-heading heading-row">
        <div>
          <p className="eyebrow">Автопарк</p>
          <h2>Выберите автомобиль</h2>
        </div>
        <p>Нажмите на карточку, чтобы открыть фотографии и подробное описание.</p>
      </div>
      <div className="container car-grid">
        {cars.map((car) => (
          <article className="car-card" key={car.id}>
            <button type="button" className="car-card-button" onClick={(event) => onOpenCar(car, event.currentTarget)}>
              <span className="car-card-media">
                <img
                  src={assetUrl(car.gallery[0].src)}
                  width={car.gallery[0].width}
                  height={car.gallery[0].height}
                  alt={car.gallery[0].alt}
                  loading={car.id === 'bmw-x6-black' ? 'eager' : 'lazy'}
                />
                <span className="photo-count">
                  <Sparkles aria-hidden="true" size={15} />
                  {car.gallery.length} фото
                </span>
              </span>
              <span className="car-card-body">
                <span className="tag">{car.className}</span>
                <strong>{car.model}</strong>
                <span className="car-summary">{car.summary}</span>
                <span className="card-open-label">
                  Подробнее
                  <ChevronRight aria-hidden="true" size={18} />
                </span>
              </span>
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

function CarModal({ car, onClose, onChoose }: { car: CarItem; onClose: () => void; onChoose: () => void }) {
  const [activePhoto, setActivePhoto] = useState(0)
  const [infoOpen, setInfoOpen] = useState(false)
  const titleId = `${car.id}-modal-title`
  const infoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'ArrowLeft') setActivePhoto((current) => (current + car.gallery.length - 1) % car.gallery.length)
      if (event.key === 'ArrowRight') setActivePhoto((current) => (current + 1) % car.gallery.length)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [car.gallery.length])

  const collapseInfo = () => {
    setInfoOpen(false)
    infoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="modal-backdrop car-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="car-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <button type="button" className="icon-button modal-close" aria-label="Закрыть карточку автомобиля" onClick={onClose}>
          <X aria-hidden="true" />
        </button>
        <div className="car-modal-grid">
          <div className="car-gallery">
            <div className="car-main-photo">
              <img
                src={assetUrl(car.gallery[activePhoto].src)}
                width={car.gallery[activePhoto].width}
                height={car.gallery[activePhoto].height}
                alt={car.gallery[activePhoto].alt}
              />
              {car.gallery.length > 1 ? (
                <>
                  <button
                    type="button"
                    className="gallery-arrow gallery-prev"
                    aria-label="Предыдущее фото"
                    onClick={() => setActivePhoto((activePhoto + car.gallery.length - 1) % car.gallery.length)}
                  >
                    <ChevronLeft aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="gallery-arrow gallery-next"
                    aria-label="Следующее фото"
                    onClick={() => setActivePhoto((activePhoto + 1) % car.gallery.length)}
                  >
                    <ChevronRight aria-hidden="true" />
                  </button>
                </>
              ) : null}
              <span className="gallery-counter">{activePhoto + 1} / {car.gallery.length}</span>
            </div>
            <div className="car-thumbnails" aria-label={`Галерея ${car.model}`}>
              {car.gallery.map((image, index) => (
                <button
                  type="button"
                  key={image.src}
                  aria-label={`Открыть фото ${index + 1}`}
                  aria-current={index === activePhoto ? 'true' : undefined}
                  onClick={() => setActivePhoto(index)}
                >
                  <img src={assetUrl(image.src)} width={image.width} height={image.height} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          </div>
          <div className="car-modal-copy">
            <p className="tag">{car.className}</p>
            <h2 id={titleId}>{car.model}</h2>
            <p className="car-modal-intro">{car.intro}</p>
            <ul className="modal-service-notes">
              <li><MapPin aria-hidden="true" size={18} /><span>Подача по Краснодару и в аэропорт</span></li>
              <li><Clock3 aria-hidden="true" size={18} /><span>Поддержка во время аренды 24/7</span></li>
              <li><ShieldCheck aria-hidden="true" size={18} /><span>Прозрачные условия по договору</span></li>
            </ul>
            <button type="button" className="button button-primary car-book-button" onClick={onChoose}>
              <CalendarCheck aria-hidden="true" size={18} />
              Выбрать эту машину
            </button>
          </div>
        </div>
        <div className="car-info" ref={infoRef}>
          <button
            type="button"
            className="info-toggle"
            aria-expanded={infoOpen}
            aria-controls={`${car.id}-info`}
            onClick={() => setInfoOpen((open) => !open)}
          >
            <span>{infoOpen ? 'Скрыть информацию о машине' : 'Показать информацию о машине'}</span>
            <ChevronDown aria-hidden="true" />
          </button>
          <div id={`${car.id}-info`} className="car-info-content" hidden={!infoOpen}>
            <p className="car-info-lead">{car.intro}</p>
            <div className="car-info-blocks">
              {car.info.map((item) => (
                <article key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
            <button type="button" className="button button-secondary collapse-info-button" onClick={collapseInfo}>
              <ChevronDown aria-hidden="true" size={18} />
              Свернуть информацию
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

function Benefits() {
  const icons = [
    MapPin,
    MapPin,
    Clock3,
    ShieldCheck,
    CalendarDays,
    Sparkles,
    CarFront,
    MapPin,
    Check,
    Send,
    Clock3,
    Sparkles,
  ]

  return (
    <section id="benefits" className="section benefits-section">
      <div className="container section-heading">
        <p className="eyebrow">Сервис</p>
        <h2>Всё необходимое для спокойной аренды</h2>
      </div>
      <div className="container benefits-grid">
        {benefits.map((item, index) => {
          const Icon = icons[index]
          return (
            <article key={item} className="benefit-card">
              <span className="feature-icon"><Icon aria-hidden="true" size={21} /></span>
              <p>{item}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function RentalProcess() {
  return (
    <section id="terms" className="section process-section">
      <div className="container section-heading">
        <p className="eyebrow">Четыре шага</p>
        <h2>Как проходит аренда</h2>
      </div>
      <div className="container steps-grid">
        {rentalSteps.map(([title, text], index) => (
          <article className="step-card" key={title}>
            <div className="step-heading">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{title}</h3>
            </div>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function AvailabilityForm({
  preferredCar,
  onOpenLegal,
}: {
  preferredCar: string
  onOpenLegal: (modal: 'privacy' | 'consent', opener: HTMLElement) => void
}) {
  const [formData, setFormData] = useState<LeadFormData>({ ...initialLeadFormData, car: preferredCar })
  const [errors, setErrors] = useState<LeadFormErrors>({})
  const [status, setStatus] = useState('')
  const [submitUrl, setSubmitUrl] = useState('')
  const [submittedChannel, setSubmittedChannel] = useState<PreferredContact>('whatsapp')
  const submittedChannelConfig = submissionChannels[submittedChannel]

  const today = useMemo(() => {
    const now = new Date()
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    return localDate.toISOString().slice(0, 10)
  }, [])

  useEffect(() => {
    setFormData((current) => ({ ...current, car: preferredCar }))
  }, [preferredCar])

  const validate = () => {
    const nextErrors: LeadFormErrors = {}
    const digits = formData.phone.replace(/\D/g, '')
    if (!formData.car) nextErrors.car = 'Выберите автомобиль.'
    if (!formData.startDate) nextErrors.startDate = 'Укажите дату начала аренды.'
    if (formData.startDate && formData.startDate < today) nextErrors.startDate = 'Дата начала уже прошла.'
    if (!formData.endDate) nextErrors.endDate = 'Укажите дату окончания аренды.'
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      nextErrors.endDate = 'Дата окончания не может быть раньше даты начала.'
    }
    if (!formData.name.trim()) nextErrors.name = 'Укажите имя.'
    if (digits.length < 10 || digits.length > 15) nextErrors.phone = 'Введите корректный номер телефона.'
    if (!formData.consent) nextErrors.consent = 'Подтвердите согласие на обработку данных.'
    return nextErrors
  }

  const updateField = <K extends keyof LeadFormData>(field: K, value: LeadFormData[K]) => {
    setFormData((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setStatus('')
    setSubmitUrl('')
  }

  const updateStartDate = (value: string) => {
    setFormData((current) => ({
      ...current,
      startDate: value,
      endDate: current.endDate && current.endDate < value ? '' : current.endDate,
    }))
    setErrors((current) => ({ ...current, startDate: undefined, endDate: undefined }))
    setStatus('')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setStatus('Проверьте выделенные поля.')
      return
    }

    const requestedChannel = ((event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)?.value
    const channel: PreferredContact = requestedChannel === 'telegram' || requestedChannel === 'sms'
      ? requestedChannel
      : 'whatsapp'
    const submissionData = { ...formData, preferredContact: channel }
    const url = buildLeadSubmissionUrl(submissionData)
    const message = buildLeadMessage(submissionData)
    const channelConfig = submissionChannels[channel]

    setSubmittedChannel(channel)
    setSubmitUrl(url)
    setStatus(channelConfig.successMessage)

    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(message).catch(() => undefined)
    }

    if (channel === 'sms') {
      window.location.href = url
    } else {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const describedBy = (field: keyof LeadFormData) => `${field}-error`

  return (
    <section id="availability" className="section availability-section">
      <div className="container form-layout">
        <div className="form-copy">
          <p className="eyebrow">Проверить доступность</p>
          <h2>Укажите автомобиль и даты</h2>
          <p>
            Выберите удобный способ отправки: WhatsApp, Telegram или обычное SMS. Форма подготовит
            сообщение с автомобилем, датами и контактами — останется проверить и отправить его.
          </p>
          <div className="form-contact-note">
            <MessageCircle aria-hidden="true" size={20} />
            <span>Ответим в выбранном канале и подтвердим доступность автомобиля.</span>
          </div>
        </div>
        <form className="availability-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="car">Автомобиль *</label>
            <select id="car" value={formData.car} onChange={(event) => updateField('car', event.target.value)} aria-invalid={Boolean(errors.car)} aria-describedby={describedBy('car')} required>
              {formCarOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
            <FieldError id="car-error" message={errors.car} />
          </div>
          <div className="form-row">
            <div className="field">
              <label htmlFor="startDate">Дата начала *</label>
              <input id="startDate" type="date" min={today} value={formData.startDate} onChange={(event) => updateStartDate(event.target.value)} aria-invalid={Boolean(errors.startDate)} aria-describedby={describedBy('startDate')} required />
              <FieldError id="startDate-error" message={errors.startDate} />
            </div>
            <div className="field">
              <label htmlFor="endDate">Дата окончания *</label>
              <input id="endDate" type="date" min={formData.startDate || today} value={formData.endDate} onChange={(event) => updateField('endDate', event.target.value)} aria-invalid={Boolean(errors.endDate)} aria-describedby={describedBy('endDate')} required />
              <FieldError id="endDate-error" message={errors.endDate} />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label htmlFor="name">Ваше имя *</label>
              <input id="name" type="text" autoComplete="name" value={formData.name} onChange={(event) => updateField('name', event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={describedBy('name')} placeholder="Например, Алексей" required />
              <FieldError id="name-error" message={errors.name} />
            </div>
            <div className="field">
              <label htmlFor="phone">Телефон *</label>
              <input id="phone" type="tel" inputMode="tel" autoComplete="tel" value={formData.phone} onChange={(event) => updateField('phone', event.target.value)} aria-invalid={Boolean(errors.phone)} aria-describedby={describedBy('phone')} placeholder="+7 999 000-00-00" required />
              <FieldError id="phone-error" message={errors.phone} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="comment">Комментарий</label>
            <textarea id="comment" rows={3} value={formData.comment} onChange={(event) => updateField('comment', event.target.value)} placeholder="Место подачи, время или важные детали" />
          </div>
          <div className="checkbox-field">
            <label>
              <input type="checkbox" checked={formData.consent} onChange={(event) => updateField('consent', event.target.checked)} aria-invalid={Boolean(errors.consent)} aria-describedby={describedBy('consent')} />
              <span>
                Я согласен на обработку данных и ознакомился с{' '}
                <button type="button" className="text-button" onClick={(event) => onOpenLegal('consent', event.currentTarget)}>условиями</button>.
              </span>
            </label>
            <FieldError id="consent-error" message={errors.consent} />
          </div>
          <div className="form-action-grid">
            <button className="button button-primary" type="submit" value="whatsapp">
              <MessageCircle aria-hidden="true" size={19} />
              WhatsApp
            </button>
            <button className="button button-secondary" type="submit" value="telegram">
              <Send aria-hidden="true" size={19} />
              Telegram
            </button>
            <button className="button button-secondary" type="submit" value="sms">
              <MessageSquareText aria-hidden="true" size={19} />
              SMS
            </button>
            <a className="button button-secondary" href={contactConfig.phoneHref}>
              <Phone aria-hidden="true" size={19} />
              Позвонить
            </a>
          </div>
          {status ? (
            <p className={`form-status ${submitUrl ? 'is-success' : 'is-error'}`} role="status">
              <span>{status}</span>
              {submitUrl ? (
                <a
                  href={submitUrl}
                  target={submittedChannel === 'sms' ? undefined : '_blank'}
                  rel={submittedChannel === 'sms' ? undefined : 'noreferrer'}
                >
                  Открыть {submittedChannelConfig.label} ещё раз
                </a>
              ) : null}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  )
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <p className={`field-error ${message ? 'is-visible' : ''}`} id={id} aria-live="polite">
      {message || '\u00a0'}
    </p>
  )
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="section">
      <div className="container section-heading">
        <p className="eyebrow">Коротко о важном</p>
        <h2>Частые вопросы</h2>
      </div>
      <div className="container faq-list">
        {faqItems.map(([question, answer], index) => (
          <article className="faq-item" key={question}>
            <h3>
              <button type="button" aria-expanded={openIndex === index} aria-controls={`faq-${index}`} onClick={() => setOpenIndex(openIndex === index ? null : index)}>
                <span>{question}</span>
                <ChevronDown aria-hidden="true" />
              </button>
            </h3>
            <div id={`faq-${index}`} hidden={openIndex !== index}><p>{answer}</p></div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Contacts() {
  return (
    <section id="contacts" className="section contact-section">
      <div className="container contact-layout">
        <div>
          <p className="eyebrow">Контакты</p>
          <h2>Свяжитесь удобным способом</h2>
          <p>Напишите модель и даты — менеджер проверит доступность и расскажет об условиях.</p>
        </div>
        <div className="contact-actions">
          <a className="button button-primary" href={contactConfig.whatsappUrl} target="_blank" rel="noreferrer">
            <MessageCircle aria-hidden="true" size={19} />
            WhatsApp
          </a>
          <a className="button button-secondary" href={contactConfig.telegramUrl} target="_blank" rel="noreferrer">
            <Send aria-hidden="true" size={19} />
            {contactConfig.telegramLabel}
          </a>
          <a className="button button-secondary" href={contactConfig.phoneHref}>
            <Phone aria-hidden="true" size={19} />
            {contactConfig.phone}
          </a>
        </div>
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className="section final-cta">
      <div className="container">
        <p className="eyebrow">Готовы выбрать?</p>
        <h2>Проверьте свободные даты за пару минут</h2>
        <p>Выберите автомобиль, заполните короткую форму и отправьте готовую заявку менеджеру.</p>
        <a className="button button-primary" href="#availability">
          <CalendarCheck aria-hidden="true" size={19} />
          Проверить даты
        </a>
      </div>
    </section>
  )
}

function Footer({ onOpenLegal }: { onOpenLegal: (modal: 'privacy' | 'consent', opener: HTMLElement) => void }) {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <a className="logo footer-logo" href="#top"><span>Аренда автомобилей</span><strong>Краснодар</strong></a>
          <p>BMW премиум-класса с подачей по Краснодару.</p>
        </div>
        <nav aria-label="Навигация в подвале">
          {navItems.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </nav>
        <div className="footer-legal">
          <a href={contactConfig.phoneHref}><Phone aria-hidden="true" size={17} />{contactConfig.phone}</a>
          <a href={contactConfig.telegramUrl} target="_blank" rel="noreferrer"><Send aria-hidden="true" size={17} />Telegram</a>
          <button type="button" onClick={(event) => onOpenLegal('privacy', event.currentTarget)}>Политика конфиденциальности</button>
          <button type="button" onClick={(event) => onOpenLegal('consent', event.currentTarget)}>Согласие на обработку данных</button>
          <span>© {new Date().getFullYear()} Аренда автомобилей Краснодар</span>
        </div>
      </div>
    </footer>
  )
}

function BottomActions() {
  return (
    <nav className="bottom-actions" aria-label="Быстрые контакты">
      <a href={contactConfig.whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" size={19} /><span>WhatsApp</span></a>
      <a href={contactConfig.telegramUrl} target="_blank" rel="noreferrer"><Send aria-hidden="true" size={19} /><span>Telegram</span></a>
    </nav>
  )
}

function BackToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button type="button" className={`back-to-top ${visible ? 'is-visible' : ''}`} aria-label="Вернуться наверх" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
      <CircleArrowUp aria-hidden="true" />
    </button>
  )
}

function LegalModal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') onClose()
  }

  return (
    <div className="modal-backdrop" role="presentation" onKeyDown={onKeyDown} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="legal-panel" role="dialog" aria-modal="true" aria-label={title}>
        <button type="button" className="icon-button modal-close" aria-label="Закрыть окно" onClick={onClose}><X aria-hidden="true" /></button>
        <h2>{title}</h2>
        {children}
      </section>
    </div>
  )
}

export default App
