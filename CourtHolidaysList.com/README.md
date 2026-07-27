# Court Holidays Calendar

Responsive React + Tailwind calendar for High Court holidays, styled as a judicial gazette / cause-list register.

## Stack

- **Vite** + **React 19** + **TypeScript**
- **Tailwind CSS** with a custom judicial palette (`tailwind.config.js`)
- Plain `fetch` + hooks (`useHolidays`) — no React Query

## API

Base URL: `VITE_API_BASE_URL` (default `https://api.courtlivestream.com`)

| Purpose | Method | Endpoint |
|---------|--------|----------|
| Courts + benches | `GET` | `/api/app/courts/list` |
| Available years | `GET` | `/api/app/holidays/years` |
| Holidays | `GET` | `/api/app/holidays?benchId={id}&year={year}` |

Auth: none. CORS: `Access-Control-Allow-Origin: *`. Dates: `YYYY-MM-DD`. Holidays are cached in memory per `benchId:year`.

The API does not return a holiday type. Types are derived from `description` (e.g. Sunday / Second Saturday / Local Holiday → restricted; named festivals → gazetted).

## Run

```bash
npm install
npm run dev
```

```bash
npm run build
```

## Components

- `CourtHolidayCalendar` — page shell + data wiring
- `SelectorBar` — court / bench / year + View Calendar
- `CalendarPanel` — month grid with holiday tinting
- `DocketList` / `DocketSlip` — scrollable year list
- `Legend` — gazetted / restricted / today
