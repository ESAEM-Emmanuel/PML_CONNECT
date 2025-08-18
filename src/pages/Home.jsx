import { useTranslation } from 'react-i18next'
import PageContence from '../components/PageContence'

export default function Home() {
  const { t } = useTranslation()

  return (
    <PageContence>
      <h1 className="text-3xl font-bold mb-6">Home</h1>
      <div className="hero min-h-[60vh] bg-base-100 rounded-xl transition-colors duration-300">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-3xl font-bold text-primary">{t('home.title', { app: t('app_name') })}</h1>
            <p className="py-6">{t('home.subtitle')}</p>
          </div>
        </div>
      </div>
      …
    </PageContence>
  )
}
