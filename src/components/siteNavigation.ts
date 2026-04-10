export type SiteNavLink = {
  label: string
  href: string
  external?: boolean
}

const baseUrl = import.meta.env.BASE_URL

export const footerLinks: readonly SiteNavLink[] = [
  {
    label: '© 2026 fingerEase',
    href: 'https://finger-ease.github.io/',
    external: true,
  },
  {
    label: '利用規約 / Terms',
    href: `${baseUrl}terms/`,
    external: false,
  },
  {
    label: 'プライバシーポリシー / Privacy Policy',
    href: `${baseUrl}privacy/`,
    external: false,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/finger-ease/Shibori',
    external: true,
  },
]

export const legalHeaderLinks: readonly SiteNavLink[] = [
  {
    label: 'トップ',
    href: baseUrl,
  },
  {
    label: 'プレイ',
    href: `${baseUrl}?play`,
  },
  {
    label: '利用規約',
    href: `${baseUrl}terms/`,
  },
  {
    label: 'プライバシー',
    href: `${baseUrl}privacy/`,
  },
]
