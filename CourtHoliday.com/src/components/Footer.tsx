import { Link } from 'react-router-dom'

interface FooterProps {
  onContactClick?: () => void
}

export function Footer({ onContactClick }: FooterProps) {
  const linkClass =
    'underline-offset-2 transition hover:text-brassLight hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass'

  return (
    <footer
      data-site-footer
      className="mt-auto shrink-0 bg-navyDeep text-parchment"
    >
      <div className="w-full px-3 py-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="max-w-md">
            <p className="font-body text-[10px] font-medium uppercase tracking-[0.16em] text-brassLight">
              Corporate Office
            </p>
            <p className="mt-0.5 font-body text-sm text-parchment">
              <a
                href="https://www.sanstrojan.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                Sanstrojan Solutions Pvt. Ltd.
              </a>
            </p>
            <p className="font-body text-xs leading-snug text-parchment/85 md:text-sm">
              Jubilee Hills, Hyderabad – 500033, Telangana, India.
            </p>
          </div>

          <div className="sm:text-right">
            {onContactClick ? (
              <button
                type="button"
                onClick={onContactClick}
                className="font-body text-[10px] font-medium uppercase tracking-[0.16em] text-brassLight underline-offset-2 transition hover:text-brass hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
              >
                Contact Us
              </button>
            ) : (
              <Link
                to="/contact"
                className="font-body text-[10px] font-medium uppercase tracking-[0.16em] text-brassLight underline-offset-2 transition hover:text-brass hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
              >
                Contact Us
              </Link>
            )}
            <p className="mt-0.5 font-body text-sm text-parchment">
              <span className="text-parchment/80">MAIL:</span>{' '}
              <a
                href="mailto:info@courtlivestream.com"
                className={linkClass}
              >
                info@courtlivestream.com
              </a>
            </p>
            <p className="font-body text-sm text-parchment">
              <span className="text-parchment/80">Phone:</span>{' '}
              <a href="tel:+919985673774" className={linkClass}>
                (+91) 9985673774
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
