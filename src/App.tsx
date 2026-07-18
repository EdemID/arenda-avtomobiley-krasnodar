import {
  CalendarCheck,
  CarFront,
  Check,
  ChevronDown,
  CircleArrowUp,
  MapPin,
  Menu,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { type Dispatch, type FormEvent, type KeyboardEvent, type SetStateAction, useEffect, useRef, useState } from 'react'
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
  serviceGroups,
  x6Gallery,
  x6Specs,
} from './data/content'
import { submitLead } from './services/submitLead'
import type { LeadFormData, LeadFormErrors } from './types/lead'

const formCarOptions = [
  'BMW 7',
  'BMW 4 Gran Coupe',
  'BMW X6 синий',
  'BMW X6 чёрный',
  'Помогите выбрать',
]

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activePhoto, setActivePhoto] = useState<number | null>(null)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [consentOpen, setConsentOpen] = useState(false)
  const [returnFocus, setReturnFocus] = useState<HTMLElement | null>(null)

  const lockScroll = menuOpen || activePhoto !== null || privacyOpen || consentOpen

  useEffect(() => {
    document.body.classList.toggle('scroll-locked', lockScroll)
    return () => document.body.classList.remove('scroll-locked')
  }, [lockScroll])

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setMenuOpen(false)
      setActivePhoto(null)
      setPrivacyOpen(false)
      setConsentOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (activePhoto === null && !privacyOpen && !consentOpen && returnFocus) {
      returnFocus.focus()
      setReturnFocus(null)
    }
  }, [activePhoto, consentOpen, privacyOpen, returnFocus])

  const openPhoto = (index: number, opener: HTMLElement) => {
    setReturnFocus(opener)
    setActivePhoto(index)
  }

  const openInfoModal = (modal: 'privacy' | 'consent', opener: HTMLElement) => {
    setReturnFocus(opener)
    if (modal === 'privacy') setPrivacyOpen(true)
    if (modal === 'consent') setConsentOpen(true)
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Перейти к основному содержанию
      </a>
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main id="main">
        <Hero />
        <Fleet />
        <X6Section onOpenPhoto={openPhoto} />
        <ServiceDescription />
        <Benefits />
        <Services />
        <RentalProcess />
        <AvailabilityForm onOpenLegal={openInfoModal} />
        <FAQ />
        <Contacts />
        <FinalCTA />
      </main>
      <Footer onOpenLegal={openInfoModal} />
      <BottomActions />
      <BackToTopButton />

      {activePhoto !== null ? (
        <ImageLightbox
          image={x6Gallery[activePhoto]}
          onClose={() => setActivePhoto(null)}
          onPrev={() => setActivePhoto((activePhoto + x6Gallery.length - 1) % x6Gallery.length)}
          onNext={() => setActivePhoto((activePhoto + 1) % x6Gallery.length)}
        />
      ) : null}

      {privacyOpen ? (
        <LegalModal title="Политика конфиденциальности" onClose={() => setPrivacyOpen(false)}>
          <p>
            Этот технический текст подготовлен как базовый шаблон для лендинга. Перед публикацией его
            необходимо заменить юридически проверенной политикой конфиденциальности.
          </p>
          <p>
            TODO: указать владельца сайта, оператора персональных данных, способы обработки, сроки
            хранения, порядок отзыва согласия и актуальные контактные данные.
          </p>
          <p>
            Форма на сайте не подключена к реальному API и в демонстрационном режиме не передаёт заявку
            менеджеру.
          </p>
        </LegalModal>
      ) : null}

      {consentOpen ? (
        <LegalModal title="Согласие на обработку персональных данных" onClose={() => setConsentOpen(false)}>
          <p>
            Нажимая кнопку проверки доступности, пользователь подтверждает согласие на обработку данных,
            указанных в форме, исключительно для связи по вопросу аренды автомобиля.
          </p>
          <p>
            TODO: перед публикацией заполнить данные владельца сайта, правовое основание обработки и
            финальную редакцию согласия.
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
      const target = event.target as Node
      if (headerRef.current && !headerRef.current.contains(target)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [menuOpen, setMenuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="site-header" ref={headerRef}>
      <div className="container header-inner">
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
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
          Узнать доступность
        </a>
      </div>
      <div
        id="mobile-menu"
        className={`mobile-menu ${menuOpen ? 'is-open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <nav aria-label="Мобильная навигация">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={closeMenu}>
              {item.label}
            </a>
          ))}
          <a className="button button-primary" href="#availability" onClick={closeMenu}>
            <CalendarCheck aria-hidden="true" size={18} />
            Узнать доступность
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
            BMW 7, BMW 4 Gran Coupe и BMW X6 с подачей к дому, отелю или в аэропорт.
            Чистые и обслуженные автомобили с полным баком. Оформление занимает около 5 минут.
          </p>
          <ul className="hero-benefits" aria-label="Короткие преимущества">
            {heroBenefits.map((item) => (
              <li key={item}>
                <Check aria-hidden="true" size={18} />
                {item}
              </li>
            ))}
          </ul>
          <p className="price-note">Стоимость зависит от автомобиля, срока аренды и выбранных условий.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#availability">
              <CalendarCheck aria-hidden="true" size={18} />
              Проверить свободные даты
            </a>
            <a className="button button-secondary" href="#cars">
              <CarFront aria-hidden="true" size={18} />
              Посмотреть автомобили
            </a>
          </div>
        </div>
        <figure className="hero-media">
          <img
            src={assetUrl('/images/cars/black-x6-hero.jpg')}
            srcSet={`${assetUrl('/images/cars/black-x6-hero.jpg')} 1320w`}
            sizes="(max-width: 860px) 100vw, 52vw"
            width="1320"
            height="889"
            alt="Чёрный BMW X6 xDrive30D на улице"
            fetchPriority="high"
          />
          <figcaption>BMW X6 xDrive30D. Видео автомобиля предоставим по запросу.</figcaption>
        </figure>
      </div>
    </section>
  )
}

function Fleet() {
  return (
    <section id="cars" className="section">
      <div className="container section-heading">
        <p className="eyebrow">Автопарк</p>
        <h2>Премиальные автомобили в аренду</h2>
      </div>
      <div className="container car-grid">
        {cars.map((car) => (
          <article className="car-card" key={car.id}>
            {car.image ? (
              <img
                src={assetUrl(car.image.src)}
                width={car.image.width}
                height={car.image.height}
                alt={car.image.alt}
                loading={car.id === 'bmw-x6-black' ? 'eager' : 'lazy'}
              />
            ) : (
              <div className="car-photo-placeholder" role="img" aria-label={car.photoNote}>
                <CarFront aria-hidden="true" size={34} />
                <span>{car.photoNote}</span>
              </div>
            )}
            <div className="car-card-body">
              <div>
                <p className="tag">{car.className}</p>
                <h3>{car.model}</h3>
                <p>{car.description}</p>
              </div>
              <div className="card-meta">
                <span>{car.priceLabel}</span>
                <span>{car.videoLabel}</span>
              </div>
              <a className="button button-secondary" href="#availability">
                Узнать доступность
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function X6Section({ onOpenPhoto }: { onOpenPhoto: (index: number, opener: HTMLElement) => void }) {
  const [specsOpen, setSpecsOpen] = useState(false)

  return (
    <section id="bmw-x6" className="section x6-section">
      <div className="container x6-layout">
        <div>
          <p className="eyebrow">Акцентная модель</p>
          <h2>Аренда BMW X6 в Краснодаре</h2>
          <p>
            Чёрный BMW X6 xDrive30D сочетает премиальный комфорт, уверенную посадку и спокойный
            деловой характер. Машина передаётся чистой и полностью заправленной.
          </p>
          <div className="x6-actions">
            <a className="button button-primary" href="#availability">
              <CalendarCheck aria-hidden="true" size={18} />
              Проверить даты
            </a>
            <span>Видео автомобиля предоставим по запросу</span>
          </div>
        </div>
        <div className="x6-media">
          <button type="button" className="main-photo-button" onClick={(event) => onOpenPhoto(0, event.currentTarget)}>
            <img
              src={assetUrl(x6Gallery[0].src)}
              width={x6Gallery[0].width}
              height={x6Gallery[0].height}
              alt={x6Gallery[0].alt}
              loading="lazy"
            />
            <span>Открыть фото</span>
          </button>
          <div className="thumb-grid" aria-label="Галерея BMW X6">
            {x6Gallery.map((image, index) => (
              <button key={image.src} type="button" onClick={(event) => onOpenPhoto(index, event.currentTarget)}>
                <img src={assetUrl(image.src)} width={image.width} height={image.height} alt={image.alt} loading="lazy" />
              </button>
            ))}
          </div>
        </div>
        <div className="specs-panel">
          <button
            type="button"
            className="specs-toggle"
            aria-expanded={specsOpen}
            aria-controls="x6-specs"
            onClick={() => setSpecsOpen((isOpen) => !isOpen)}
          >
            <span>{specsOpen ? 'Скрыть информацию о машине' : 'Показать информацию о машине'}</span>
            <ChevronDown aria-hidden="true" />
          </button>
          <dl id="x6-specs" className="spec-grid" hidden={!specsOpen}>
            {x6Specs.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

function ServiceDescription() {
  return (
    <section className="section service-description">
      <div className="container narrow">
        <p>
          BMW 7, BMW 4 Gran Coupe, синий BMW X6 и лаконичный чёрный BMW X6 — с подачей к дому,
          отелю или в аэропорт. Автомобили регулярно обслуживаются и перед каждой арендой проходят
          мойку. Машина передаётся чистой и с полным баком. Оформление занимает около 5 минут: без
          длинных звонков и ненужной бюрократии.
        </p>
        <div className="callout">
          <MessageCircle aria-hidden="true" />
          <div>
            <h2>Напишите нам — проверим даты</h2>
            <p>
              Расскажем об условиях и предварительно зарезервируем автомобиль. Также можно оставить
              номер телефона: мы перезвоним без переключений между менеджерами.
            </p>
            <span>Видео выбранного автомобиля предоставим по запросу.</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function Benefits() {
  return (
    <section id="benefits" className="section">
      <div className="container section-heading">
        <p className="eyebrow">Преимущества</p>
        <h2>Почему выбирают нашу аренду автомобилей</h2>
      </div>
      <div className="container benefits-grid">
        {benefits.map((item, index) => (
          <article key={item} className="benefit-card">
            {index % 3 === 0 ? <ShieldCheck aria-hidden="true" /> : index % 3 === 1 ? <MapPin aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
            <p>{item}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function Services() {
  return (
    <section id="services" className="section muted-section">
      <div className="container section-heading">
        <p className="eyebrow">Услуги</p>
        <h2>Услуги аренды автомобилей</h2>
      </div>
      <div className="container services-grid">
        {serviceGroups.map((group) => (
          <article className="service-group" key={group.title}>
            <h3>{group.title}</h3>
            <ul>
              {group.items.map((item) => (
                <li key={item}>
                  <Check aria-hidden="true" size={17} />
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}

function RentalProcess() {
  return (
    <section id="terms" className="section">
      <div className="container section-heading">
        <p className="eyebrow">Условия</p>
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
  onOpenLegal,
}: {
  onOpenLegal: (modal: 'privacy' | 'consent', opener: HTMLElement) => void
}) {
  const [formData, setFormData] = useState<LeadFormData>(initialLeadFormData)
  const [errors, setErrors] = useState<LeadFormErrors>({})
  const [status, setStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const minEndDate = formData.startDate || undefined

  const validate = () => {
    const nextErrors: LeadFormErrors = {}
    if (!formData.car) nextErrors.car = 'Выберите автомобиль.'
    if (!formData.startDate) nextErrors.startDate = 'Укажите дату начала аренды.'
    if (!formData.endDate) nextErrors.endDate = 'Укажите дату окончания аренды.'
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      nextErrors.endDate = 'Дата окончания не может быть раньше даты начала.'
    }
    if (!formData.name.trim()) nextErrors.name = 'Укажите имя.'
    if (!formData.phone.trim()) nextErrors.phone = 'Укажите номер телефона.'
    if (!/^[+()\-\s\d]{7,}$/.test(formData.phone.trim())) {
      nextErrors.phone = 'Введите номер в удобном российском формате.'
    }
    if (!formData.consent) nextErrors.consent = 'Подтвердите согласие на обработку персональных данных.'
    return nextErrors
  }

  const updateField = <K extends keyof LeadFormData>(field: K, value: LeadFormData[K]) => {
    setFormData((current) => ({ ...current, [field]: value }))
    setSubmitted(false)
    setStatus('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const result = await submitLead(formData)
      setStatus(result.message)
      setSubmitted(true)
    } catch {
      setStatus('Не удалось проверить форму. Попробуйте ещё раз или проверьте подключение API.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const describedBy = (field: keyof LeadFormData) => (errors[field] ? `${field}-error` : undefined)

  return (
    <section id="availability" className="section availability-section">
      <div className="container form-layout">
        <div>
          <p className="eyebrow">Проверка доступности</p>
          <h2>Оставьте даты и предпочтительный BMW</h2>
          <p>
            Реальная отправка заявки пока не подключена. После заполнения форма покажет, что данные
            прошли проверку и готовы к подключению API.
          </p>
        </div>
        <form className="availability-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="car">Автомобиль *</label>
            <select
              id="car"
              value={formData.car}
              onChange={(event) => updateField('car', event.target.value)}
              aria-invalid={Boolean(errors.car)}
              aria-describedby={describedBy('car')}
              required
            >
              {formCarOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <FieldError id="car-error" message={errors.car} />
          </div>
          <div className="form-row">
            <div className="field">
              <label htmlFor="startDate">Дата начала *</label>
              <input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(event) => updateField('startDate', event.target.value)}
                aria-invalid={Boolean(errors.startDate)}
                aria-describedby={describedBy('startDate')}
                required
              />
              <FieldError id="startDate-error" message={errors.startDate} />
            </div>
            <div className="field">
              <label htmlFor="endDate">Дата окончания *</label>
              <input
                id="endDate"
                type="date"
                min={minEndDate}
                value={formData.endDate}
                onChange={(event) => updateField('endDate', event.target.value)}
                aria-invalid={Boolean(errors.endDate)}
                aria-describedby={describedBy('endDate')}
                required
              />
              <FieldError id="endDate-error" message={errors.endDate} />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label htmlFor="name">Имя *</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(event) => updateField('name', event.target.value)}
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={describedBy('name')}
                required
              />
              <FieldError id="name-error" message={errors.name} />
            </div>
            <div className="field">
              <label htmlFor="phone">Номер телефона *</label>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                placeholder="+7"
                value={formData.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                autoComplete="tel"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={describedBy('phone')}
                required
              />
              <FieldError id="phone-error" message={errors.phone} />
            </div>
          </div>
          <fieldset className="field">
            <legend>Предпочтительный способ связи *</legend>
            <div className="radio-group">
              {(['phone', 'telegram', 'whatsapp'] as const).map((method) => (
                <label key={method}>
                  <input
                    type="radio"
                    name="preferredContact"
                    checked={formData.preferredContact === method}
                    onChange={() => updateField('preferredContact', method)}
                  />
                  {method === 'phone' ? 'Телефон' : method === 'telegram' ? 'Telegram' : 'WhatsApp'}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="field">
            <label htmlFor="comment">Комментарий</label>
            <textarea
              id="comment"
              value={formData.comment}
              onChange={(event) => updateField('comment', event.target.value)}
              rows={4}
              placeholder="Например: нужна подача к отелю или детское кресло"
            />
          </div>
          <div className="field checkbox-field">
            <label>
              <input
                type="checkbox"
                checked={formData.consent}
                onChange={(event) => updateField('consent', event.target.checked)}
                aria-invalid={Boolean(errors.consent)}
                aria-describedby={describedBy('consent')}
                required
              />
              <span>
                Согласен на обработку персональных данных. Ознакомиться с{' '}
                <button type="button" className="text-button" onClick={(event) => onOpenLegal('privacy', event.currentTarget)}>
                  политикой конфиденциальности
                </button>{' '}
                и{' '}
                <button type="button" className="text-button" onClick={(event) => onOpenLegal('consent', event.currentTarget)}>
                  согласием
                </button>
                .
              </span>
            </label>
            <FieldError id="consent-error" message={errors.consent} />
          </div>
          <button className="button button-primary form-submit" type="submit" disabled={isSubmitting || submitted}>
            <CalendarCheck aria-hidden="true" size={18} />
            {isSubmitting ? 'Проверяем...' : submitted ? 'Проверено' : 'Проверить доступность'}
          </button>
          {status ? (
            <p className={`form-status ${submitted ? 'is-success' : 'is-error'}`} role="status" aria-live="polite">
              {status}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  )
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p className="field-error" id={id}>
      {message}
    </p>
  ) : null
}

function FAQ() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set([0]))

  const toggle = (index: number) => {
    setOpenItems((current) => {
      const next = new Set(current)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <section id="faq" className="section">
      <div className="container section-heading">
        <p className="eyebrow">FAQ</p>
        <h2>Частые вопросы</h2>
      </div>
      <div className="container faq-list">
        {faqItems.map(([question, answer], index) => {
          const isOpen = openItems.has(index)
          return (
            <article className="faq-item" key={question}>
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${index}`}
                  onClick={() => toggle(index)}
                >
                  {question}
                  <ChevronDown aria-hidden="true" />
                </button>
              </h3>
              <div id={`faq-panel-${index}`} hidden={!isOpen}>
                <p>{answer}</p>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function Contacts() {
  const hasContact = contactConfig.phone || contactConfig.telegramUrl || contactConfig.whatsappUrl || contactConfig.email

  return (
    <section id="contacts" className="section contact-section">
      <div className="container contact-layout">
        <div>
          <p className="eyebrow">Контакты</p>
          <h2>Краснодар. Напишите нам или оставьте номер телефона — проверим даты и расскажем об условиях аренды.</h2>
        </div>
        <div className="contact-actions">
          {contactConfig.phone ? <a className="button button-primary" href={`tel:${contactConfig.phone}`}>Позвонить</a> : null}
          {contactConfig.telegramUrl ? <a className="button button-secondary" href={contactConfig.telegramUrl}>Telegram</a> : null}
          {contactConfig.whatsappUrl ? <a className="button button-secondary" href={contactConfig.whatsappUrl}>WhatsApp</a> : null}
          {contactConfig.email ? <a className="button button-secondary" href={`mailto:${contactConfig.email}`}>Email</a> : null}
          {!hasContact ? (
            <a className="button button-primary" href="#availability">
              <CalendarCheck aria-hidden="true" size={18} />
              Оставить номер
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className="section final-cta">
      <div className="container">
        <h2>Узнайте за несколько минут, свободен ли выбранный BMW на ваши даты</h2>
        <p>Краснодар. Работаем быстро и без лишней бюрократии.</p>
        <a className="button button-primary" href="#availability">
          <CalendarCheck aria-hidden="true" size={18} />
          Проверить свободные даты
        </a>
      </div>
    </section>
  )
}

function Footer({
  onOpenLegal,
}: {
  onOpenLegal: (modal: 'privacy' | 'consent', opener: HTMLElement) => void
}) {
  const currentYear = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <a className="logo footer-logo" href="#top">
            <span>Аренда автомобилей</span>
            <strong>Краснодар</strong>
          </a>
          <p>Прокат премиальных BMW с подачей по Краснодару, к отелю или в аэропорт.</p>
        </div>
        <nav aria-label="Ссылки в подвале">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="footer-legal">
          <button type="button" onClick={(event) => onOpenLegal('privacy', event.currentTarget)}>
            Политика конфиденциальности
          </button>
          <button type="button" onClick={(event) => onOpenLegal('consent', event.currentTarget)}>
            Согласие на обработку персональных данных
          </button>
          <span>{currentYear}</span>
        </div>
      </div>
    </footer>
  )
}

function BottomActions() {
  return (
    <nav className="bottom-actions" aria-label="Быстрые действия">
      <a href="#availability">
        <MessageCircle aria-hidden="true" size={18} />
        Оставить номер
      </a>
      <a href="#availability">
        <CalendarCheck aria-hidden="true" size={18} />
        Проверить даты
      </a>
    </nav>
  )
}

function BackToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 520)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    document.querySelector('#top')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <button
      className={`back-to-top ${visible ? 'is-visible' : ''}`}
      type="button"
      aria-label="Вернуться в начало страницы"
      onClick={scrollToTop}
    >
      <CircleArrowUp aria-hidden="true" />
    </button>
  )
}

function ImageLightbox({
  image,
  onClose,
  onPrev,
  onNext,
}: {
  image: (typeof x6Gallery)[number]
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  const stopPropagation = (event: React.MouseEvent) => event.stopPropagation()

  return (
    <div className="modal-backdrop lightbox" role="presentation" onMouseDown={onClose}>
      <div
        className="lightbox-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Просмотр фотографии BMW X6"
        onMouseDown={stopPropagation}
      >
        <button ref={closeRef} className="icon-button modal-close" type="button" onClick={onClose} aria-label="Закрыть фото">
          <X aria-hidden="true" />
        </button>
        <img src={assetUrl(image.src)} width={image.width} height={image.height} alt={image.alt} />
        <div className="lightbox-controls">
          <button className="button button-secondary" type="button" onClick={onPrev}>
            Предыдущее
          </button>
          <button className="button button-secondary" type="button" onClick={onNext}>
            Следующее
          </button>
        </div>
      </div>
    </div>
  )
}

function LegalModal({
  title,
  children,
  onClose,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Tab') {
      const focusable = event.currentTarget.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="legal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-title"
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <button ref={closeRef} className="icon-button modal-close" type="button" onClick={onClose} aria-label="Закрыть окно">
          <X aria-hidden="true" />
        </button>
        <h2 id="legal-title">{title}</h2>
        {children}
      </div>
    </div>
  )
}

export default App
