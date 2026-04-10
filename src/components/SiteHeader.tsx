import type { SiteNavLink } from './siteNavigation'

type SiteHeaderProps = {
  links: readonly SiteNavLink[]
}

export function SiteHeader({ links }: SiteHeaderProps) {
  return (
    <header className="relative z-20 shrink-0 border-b border-white/[0.06] bg-black px-5 py-4 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-3">
        <a
          href={import.meta.env.BASE_URL}
          className="text-lg font-bold tracking-tight text-emerald-50 drop-shadow-sm transition hover:text-emerald-100 md:text-xl"
        >
          Shibori
        </a>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className="text-emerald-100/80 transition hover:text-emerald-50"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
