import { useEffect } from 'react'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'
import { legalHeaderLinks } from './siteNavigation'
import { useLegalPageTheme } from '../hooks/useLegalPageTheme'

export function TermsPage() {
  useLegalPageTheme()

  useEffect(() => {
    document.title = 'Shibori 利用規約 / Terms of Service'
  }, [])

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-slate-50">
      <SiteHeader links={legalHeaderLinks} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-8 text-slate-900">
        <h1 className="text-3xl font-bold">Shibori 利用規約 / Terms of Service</h1>
        <p className="mt-2 text-sm text-slate-600">
          最終更新日 / Last updated: April 10, 2026
        </p>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-semibold">日本語</h2>
          <p className="mt-4">
            本利用規約は、Shibori（本ページおよびその機能）の利用条件を定めるものです。
          </p>
          <h3 className="mt-4 font-semibold">1. 適用範囲</h3>
          <p>Shibori の利用に適用されます。</p>
          <h3 className="mt-4 font-semibold">2. 禁止事項</h3>
          <p>法令違反、不正アクセス、権利侵害、運営妨害行為を禁止します。</p>
          <h3 className="mt-4 font-semibold">3. 免責事項</h3>
          <p>本サービスは現状有姿で提供され、運営者は法令上許される範囲で責任を負いません。</p>
          <h3 className="mt-4 font-semibold">4. 知的財産</h3>
          <p>本サービスに関する知的財産権は運営者または正当な権利者に帰属します。</p>
          <h3 className="mt-4 font-semibold">5. 広告</h3>
          <p>Google AdSense 等の第三者広告サービスを利用する場合があります。</p>
          <h3 className="mt-4 font-semibold">6. 規約変更</h3>
          <p>規約は必要に応じて改定され、掲載時点で効力を生じます。</p>
          <h3 className="mt-4 font-semibold">7. 準拠法</h3>
          <p>日本法に準拠します。</p>
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
          <p className="mt-4">
            These Terms govern use of Shibori and its related features.
          </p>
          <h3 className="mt-4 font-semibold">1. Scope</h3>
          <p>These Terms apply to Shibori.</p>
          <h3 className="mt-4 font-semibold">2. Prohibited Conduct</h3>
          <p>Illegal acts, unauthorized access, rights violations, and disruption are prohibited.</p>
          <h3 className="mt-4 font-semibold">3. Disclaimer</h3>
          <p>Shibori is provided "as is" and liability is limited to the extent permitted by law.</p>
          <h3 className="mt-4 font-semibold">4. Intellectual Property</h3>
          <p>IP rights belong to the operator or legitimate rights holders.</p>
          <h3 className="mt-4 font-semibold">5. Advertising</h3>
          <p>Shibori may use third-party advertising services such as Google AdSense.</p>
          <h3 className="mt-4 font-semibold">6. Changes to Terms</h3>
          <p>These Terms may be revised and become effective when published.</p>
          <h3 className="mt-4 font-semibold">7. Governing Law</h3>
          <p>These Terms are governed by the laws of Japan.</p>
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
