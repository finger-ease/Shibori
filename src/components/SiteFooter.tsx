import { footerLinks, type SiteNavLink } from './siteNavigation'

type SiteFooterProps = {
  links?: readonly SiteNavLink[]
}

export function SiteFooter({ links = footerLinks }: SiteFooterProps) {
  return (
    <footer className="relative z-20 shrink-0 border-t border-white/[0.06] bg-black px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8 lg:px-12">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target={link.external ? '_blank' : undefined}
            rel={link.external ? 'noopener noreferrer' : undefined}
            className="text-emerald-100/75 transition hover:text-emerald-50"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  )
}
