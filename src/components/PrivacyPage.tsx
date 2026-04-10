import { useEffect } from 'react'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'
import { legalHeaderLinks } from './siteNavigation'
import { useLegalPageTheme } from '../hooks/useLegalPageTheme'

export function PrivacyPage() {
  useLegalPageTheme()

  useEffect(() => {
    document.title = 'Shibori プライバシーポリシー / Privacy Policy'
  }, [])

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-slate-50">
      <SiteHeader links={legalHeaderLinks} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-8 text-slate-900">
        <h1 className="text-3xl font-bold">Shibori プライバシーポリシー / Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-600">
          施行日 / Effective date: April 10, 2026
        </p>
        <p className="text-sm text-slate-600">最終更新日 / Last updated: April 10, 2026</p>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-semibold">日本語</h2>
          <h3 className="mt-4 font-semibold">1. 取得する情報</h3>
          <p>アクセスログ、Cookie、広告関連識別子等を取得する場合があります。</p>
          <h3 className="mt-4 font-semibold">2. 利用目的</h3>
          <p>運営改善、不正対策、広告配信・計測のために利用します。</p>
          <h3 className="mt-4 font-semibold">3. 第三者提供・外部送信</h3>
          <p>Google AdSense 等の第三者サービスへ情報が送信される場合があります。</p>
          <h3 className="mt-4 font-semibold">4. Cookie の無効化</h3>
          <p>ブラウザ設定で無効化できますが、一部機能に影響する場合があります。</p>
          <h3 className="mt-4 font-semibold">5. 保持期間・安全管理</h3>
          <p>合理的期間保持し、適切な安全管理措置を講じます。</p>
          <h3 className="mt-4 font-semibold">6. 子どもの利用への配慮</h3>
          <p>関連法令やガイドラインに基づき、子どもの個人情報保護に配慮します。</p>
          <h3 className="mt-4 font-semibold">7. 改定</h3>
          <p>必要に応じて改定し、本ページ掲載時点で効力を生じます。</p>
          <h3 className="mt-4 font-semibold">8. 問い合わせ</h3>
          <p>
            <a
              className="text-emerald-700 underline"
              href="https://github.com/finger-ease/Shibori/issues"
            >
              GitHub Issues
            </a>
          </p>
        </section>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-semibold">English</h2>
          <h3 className="mt-4 font-semibold">1. Information We May Collect</h3>
          <p>Access logs, cookies, and ad-related identifiers may be collected.</p>
          <h3 className="mt-4 font-semibold">2. Purpose of Use</h3>
          <p>For service improvement, fraud prevention, and ad delivery/measurement.</p>
          <h3 className="mt-4 font-semibold">3. Third-Party Sharing and Transmission</h3>
          <p>Information may be sent to third-party services such as Google AdSense.</p>
          <h3 className="mt-4 font-semibold">4. Disabling Cookies</h3>
          <p>You can control cookies in your browser settings.</p>
          <h3 className="mt-4 font-semibold">5. Retention and Security</h3>
          <p>Information is retained for a reasonable period with security controls.</p>
          <h3 className="mt-4 font-semibold">6. Children's Privacy</h3>
          <p>We operate with consideration for children's privacy under applicable laws.</p>
          <h3 className="mt-4 font-semibold">7. Revisions</h3>
          <p>This policy may be revised and becomes effective when posted.</p>
          <h3 className="mt-4 font-semibold">8. Contact</h3>
          <p>
            <a
              className="text-emerald-700 underline"
              href="https://github.com/finger-ease/Shibori/issues"
            >
              GitHub Issues
            </a>
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
