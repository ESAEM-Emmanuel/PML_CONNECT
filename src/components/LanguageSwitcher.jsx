import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost">
        <Languages className="w-5 h-5" />
        <span className="ml-2 hidden sm:inline">{t('language.label')}</span>
      </label>
      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
        <li><button onClick={() => i18n.changeLanguage('fr')}>{t('language.fr')}</button></li>
        <li><button onClick={() => i18n.changeLanguage('en')}>{t('language.en')}</button></li>
      </ul>
    </div>
  )
}