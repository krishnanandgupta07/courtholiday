import { useState } from 'react'
import { ContactUsPage } from './components/ContactUsPage'
import { CourtHolidayCalendar } from './components/CourtHolidayCalendar'

type AppPage = 'calendar' | 'contact'

export default function App() {
  const [page, setPage] = useState<AppPage>('calendar')
  const goHome = () => setPage('calendar')

  if (page === 'contact') {
    return (
      <ContactUsPage
        onBack={goHome}
        onOpenContact={() => setPage('contact')}
      />
    )
  }

  return (
    <CourtHolidayCalendar
      onContactClick={() => setPage('contact')}
      onHomeClick={goHome}
    />
  )
}
