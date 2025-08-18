import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'

export default function Login() {
  const { register, handleSubmit } = useForm()
  const { login } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const onSubmit = async (values) => {
    await login(values)
    navigate('/')
  }

  return (
    <div className="max-w-md mx-auto mt-10 card bg-base-100 shadow-lg transition-colors duration-300">
      <div className="card-body">
        <h2 className="card-title text-primary">{t('nav.login')}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input {...register('username')} placeholder={t('auth.username')} className="input input-bordered w-full" />
          <input {...register('password')} type="password" placeholder={t('auth.password')} className="input input-bordered w-full" />
          <button className="btn btn-primary w-full">{t('auth.login')}</button>
        </form>
        <div className="flex justify-between mt-2 text-sm">
          <Link to="/forgot-password" className="link">{t('auth.forgot_password')}</Link>
          <Link to="/signup" className="link">{t('auth.no_account')} {t('auth.signup')}</Link>
        </div>
      </div>
    </div>
  )
}
