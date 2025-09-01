import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'

export default function ForgotPassword() {
  const { register, handleSubmit } = useForm()
  const { forgotPassword } = useAuth()
  const { t } = useTranslation()

  const onSubmit = async (values) => {
    try {
      await forgotPassword(values);
      toast.success(t('auth.email_sent'));
    } catch (err) {
      toast.error(err?.response?.data?.message || t('errors.generic'));
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 card bg-base-100 shadow transition-colors duration-300">
      <div className="card-body">
        <h2 className="card-title text-primary">{t('auth.reset_title')}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <span className="text-red-500 ml-1">*</span>
          <input
            {...register('email', { required: true })}
            placeholder={t('auth.email')}
            className="input input-bordered w-full"
          />
          <button className="btn btn-primary w-full">
            {t('auth.reset')}
          </button>
        </form>
      </div>
    </div>
  )
}
