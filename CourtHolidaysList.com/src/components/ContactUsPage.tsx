import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react'
import { submitContactUs } from '../api/client'
import type { ContactUsPayload } from '../types/api'
import { Footer } from './Footer'
import { AppDownloadBanner } from './AppDownloadBanner'

interface ContactUsPageProps {
  onBack: () => void
  onOpenContact?: () => void
}

type FormFieldKey = 'fullName' | 'phoneNumber' | 'emailAddress' | 'subject' | 'message'

interface ContactFormValues {
  fullName: string
  phoneNumber: string
  emailAddress: string
  subject: string
  message: string
}

const INITIAL_VALUES: ContactFormValues = {
  fullName: '',
  phoneNumber: '',
  emailAddress: '',
  subject: '',
  message: '',
}

function validateField(key: FormFieldKey, value: string): string | null {
  const trimmed = value.trim()

  switch (key) {
    case 'fullName':
      if (!trimmed) return 'Please enter your full name.'
      if (trimmed.length < 2) return 'Name must be at least 2 characters.'
      return null
    case 'phoneNumber': {
      const digits = trimmed.replace(/\D/g, '')
      if (!digits) return 'Please enter your mobile number.'
      if (digits.length !== 10) return 'Enter a valid 10-digit mobile number.'
      return null
    }
    case 'emailAddress':
      if (!trimmed) return 'Please enter your email address.'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        return 'Enter a valid email address.'
      }
      return null
    case 'subject':
      if (!trimmed) return 'Please enter a subject.'
      if (trimmed.length < 3) return 'Subject must be at least 3 characters.'
      return null
    case 'message':
      if (!trimmed) return 'Please enter your message.'
      if (trimmed.length < 10) return 'Message must be at least 10 characters.'
      return null
    default:
      return null
  }
}

function FieldShell({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string
  hint?: string
  error?: string | null
  required?: boolean
  children: ReactNode
}) {
  return (
    <div className="group relative overflow-hidden rounded-sm border border-brassLight/45 bg-parchment/95 p-3 shadow-slip transition focus-within:border-brass focus-within:ring-1 focus-within:ring-brass/40">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-brass to-navy opacity-70" />
      <label className="mb-1.5 flex items-baseline justify-between gap-2 pl-2">
        <span className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-navy">
          {label}
          {required ? <span className="ml-1 text-burgundy">*</span> : null}
        </span>
        {hint ? (
          <span className="font-mono text-[10px] text-inkSoft">{hint}</span>
        ) : null}
      </label>
      <div className="pl-2">{children}</div>
      {error ? (
        <p className="mt-1.5 pl-2 font-body text-xs text-burgundy" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

const controlClass =
  'w-full border-0 bg-transparent p-0 font-body text-sm text-ink outline-none placeholder:text-inkSoft/70'

export function ContactUsPage({ onBack, onOpenContact }: ContactUsPageProps) {
  const formId = useId()
  const [values, setValues] = useState<ContactFormValues>(INITIAL_VALUES)
  const [errors, setErrors] = useState<Partial<Record<FormFieldKey, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<FormFieldKey, boolean>>>(
    {},
  )
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const setField = (key: FormFieldKey, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setSuccessMessage(null)
    setFormError(null)
    if (touched[key]) {
      setErrors((prev) => ({
        ...prev,
        [key]: validateField(key, value) ?? undefined,
      }))
    }
  }

  const markTouched = (key: FormFieldKey) => {
    setTouched((prev) => ({ ...prev, [key]: true }))
    setErrors((prev) => ({
      ...prev,
      [key]: validateField(key, values[key]) ?? undefined,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSuccessMessage(null)
    setFormError(null)

    const nextErrors: Partial<Record<FormFieldKey, string>> = {}
    ;(Object.keys(values) as FormFieldKey[]).forEach((key) => {
      const error = validateField(key, values[key])
      if (error) nextErrors[key] = error
    })
    setTouched({
      fullName: true,
      phoneNumber: true,
      emailAddress: true,
      subject: true,
      message: true,
    })
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setFormError('Please correct the highlighted fields and try again.')
      return
    }

    const payload: ContactUsPayload = {
      userId: null,
      fullName: values.fullName.trim(),
      phoneNumber: values.phoneNumber.replace(/\D/g, ''),
      emailAddress: values.emailAddress.trim(),
      subject: values.subject.trim(),
      message: values.message.trim(),
      source: 'court-holidays',
    }

    setSubmitting(true)
    try {
      const result = await submitContactUs(payload)
      setSuccessMessage(
        result.message?.trim() ||
          'Thank you. Your message has been submitted successfully.',
      )
      setValues(INITIAL_VALUES)
      setErrors({})
      setTouched({})
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'Unable to submit right now. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleSuccessClose = () => {
    setSuccessMessage(null)
    onBack()
  }

  useEffect(() => {
    if (!successMessage) return
    const timer = window.setTimeout(() => {
      setSuccessMessage(null)
      onBack()
    }, 2200)
    return () => window.clearTimeout(timer)
  }, [successMessage, onBack])

  return (
    <div className="flex min-h-screen w-full min-w-0 flex-col bg-parchment bg-parchment-grid bg-grid text-ink">
      <div className="flex w-full min-w-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-brassLight/25 bg-masthead text-parchment">
        <div className="flex w-full items-center justify-between gap-3 px-3 py-2.5 sm:px-4 md:px-6 lg:px-8">
          <button
            type="button"
            onClick={onBack}
            className="flex min-w-0 items-center gap-2 rounded-sm text-left transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
            aria-label="Go to home page"
          >
            <img
              src="/images/CourtLiveLogo.jpeg"
              alt="Court Holidays List – Indian court holiday calendar logo"
              className="h-6 w-auto shrink-0 rounded-sm border border-brassLight/30 bg-parchment object-contain"
              width={60}
              height={24}
              loading="eager"
              decoding="async"
            />
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-brassLight">
                Court Holidays List
              </p>
              <h1 className="font-display text-lg leading-tight tracking-tight sm:text-xl">
                Contact Us
              </h1>
            </div>
          </button>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-sm border border-brassLight/40 bg-navyDeep/50 px-3 py-1.5 font-body text-xs font-semibold text-parchment transition hover:border-brassLight hover:bg-navyDeep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          >
            ← Back to Calendar
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-3 py-5 sm:px-4 sm:py-6 md:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <aside className="overflow-hidden border border-brassLight/50 bg-navy text-parchment shadow-slip">
            <div className="border-b border-white/10 px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-brassLight">
                Reach our team
              </p>
              <h2 className="mt-1 font-display text-xl leading-tight">
                We are here to help
              </h2>
            </div>
            <div className="space-y-4 px-4 py-4 font-body text-sm">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-brassLight">
                  Email
                </p>
                <a
                  href="mailto:info@courtlivestream.com"
                  className="mt-0.5 inline-block text-parchment underline-offset-2 hover:text-brassLight hover:underline"
                >
                  info@courtlivestream.com
                </a>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-brassLight">
                  Phone
                </p>
                <a
                  href="tel:+919985673774"
                  className="mt-0.5 inline-block text-parchment underline-offset-2 hover:text-brassLight hover:underline"
                >
                  (+91) 9985673774
                </a>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-brassLight">
                  Office
                </p>
                <p className="mt-0.5 leading-snug text-parchment/90">
                  Sanstrojan Solutions Pvt. Ltd.
                  <br />
                  Jubilee Hills, Hyderabad – 500033,
                  <br />
                  Telangana, India.
                </p>
              </div>
            </div>
          </aside>

          <section
            aria-labelledby={`${formId}-title`}
            className="border border-brassLight/55 bg-parchment/90 shadow-slip"
          >
            <div className="border-b border-brassLight/40 bg-parchmentDim/40 px-4 py-3">
              <h2
                id={`${formId}-title`}
                className="font-display text-xl leading-tight text-navy"
              >
                Send a message
              </h2>
              <p className="mt-1 font-body text-sm text-inkSoft">
                Fill each field below. We will get back to you shortly.
              </p>
            </div>

            <form
              onSubmit={(event) => void handleSubmit(event)}
              className="space-y-3 p-3 sm:p-4"
              noValidate
            >
              <FieldShell
                label="Full name"
                required
                error={touched.fullName ? errors.fullName : null}
              >
                <input
                  id={`${formId}-fullName`}
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  className={controlClass}
                  value={values.fullName}
                  onChange={(e) => setField('fullName', e.target.value)}
                  onBlur={() => markTouched('fullName')}
                  disabled={submitting}
                />
              </FieldShell>

              <FieldShell
                label="Mobile number"
                hint="10 digits"
                required
                error={touched.phoneNumber ? errors.phoneNumber : null}
              >
                <input
                  id={`${formId}-phoneNumber`}
                  name="phoneNumber"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="Enter mobile number"
                  className={controlClass}
                  value={values.phoneNumber}
                  onChange={(e) =>
                    setField(
                      'phoneNumber',
                      e.target.value.replace(/[^\d+\s-]/g, '').slice(0, 15),
                    )
                  }
                  onBlur={() => markTouched('phoneNumber')}
                  disabled={submitting}
                />
              </FieldShell>

              <FieldShell
                label="Email"
                required
                error={touched.emailAddress ? errors.emailAddress : null}
              >
                <input
                  id={`${formId}-emailAddress`}
                  name="emailAddress"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  className={controlClass}
                  value={values.emailAddress}
                  onChange={(e) => setField('emailAddress', e.target.value)}
                  onBlur={() => markTouched('emailAddress')}
                  disabled={submitting}
                />
              </FieldShell>

              <FieldShell
                label="Subject"
                required
                error={touched.subject ? errors.subject : null}
              >
                <input
                  id={`${formId}-subject`}
                  name="subject"
                  type="text"
                  placeholder="What is this about?"
                  className={controlClass}
                  value={values.subject}
                  onChange={(e) => setField('subject', e.target.value)}
                  onBlur={() => markTouched('subject')}
                  disabled={submitting}
                />
              </FieldShell>

              <FieldShell
                label="Message"
                hint="Min. 10 characters"
                required
                error={touched.message ? errors.message : null}
              >
                <textarea
                  id={`${formId}-message`}
                  name="message"
                  rows={5}
                  placeholder="Write your message here..."
                  className={`${controlClass} resize-y min-h-[7rem]`}
                  value={values.message}
                  onChange={(e) => setField('message', e.target.value)}
                  onBlur={() => markTouched('message')}
                  disabled={submitting}
                />
              </FieldShell>

              {formError ? (
                <div
                  role="alert"
                  className="border border-burgundy/35 bg-burgundyDim px-3 py-2 font-body text-sm text-burgundy"
                >
                  {formError}
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex min-h-10 items-center justify-center rounded-sm bg-navy px-5 py-2 font-body text-sm font-semibold text-parchment transition hover:bg-navyDeep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-parchment disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {submitting ? 'Submitting…' : 'Submit message'}
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  disabled={submitting}
                  className="inline-flex min-h-10 items-center justify-center rounded-sm border border-brassLight/70 bg-parchment px-4 py-2 font-body text-sm text-navy transition hover:bg-parchmentDim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass disabled:opacity-55"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>

      {successMessage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navyDeep/55 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${formId}-success-title`}
        >
          <div className="w-full max-w-sm border border-brassLight/50 bg-parchment p-5 shadow-slip">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-brass">
              Success
            </p>
            <h2
              id={`${formId}-success-title`}
              className="mt-1 font-display text-xl text-navy"
            >
              Message sent
            </h2>
            <p className="mt-2 font-body text-sm leading-relaxed text-inkSoft">
              {successMessage}
            </p>
            <button
              type="button"
              onClick={handleSuccessClose}
              className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-sm bg-navy px-4 py-2 font-body text-sm font-semibold text-parchment transition hover:bg-navyDeep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
            >
              Back to Calendar
            </button>
          </div>
        </div>
      ) : null}

      <AppDownloadBanner />
      </div>
      <Footer onContactClick={onOpenContact ?? (() => undefined)} />
    </div>
  )
}
