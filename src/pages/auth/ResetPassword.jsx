import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import PasswordField from '../../components/PasswordField';

export default function ResetPassword() {
  const { token } = useParams();          // /reset-password/:token
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { reset } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const onSubmit = async ({ password }) => {
    const res = await reset({ token, password });
    console.log(res);
    if (res.success) navigate('/login');
  };

  return (
    <div className="max-w-md mx-auto mt-10 card bg-base-100 shadow-lg transition-colors duration-300">
        <div className="card-body">
            <h2 className="card-title">{t('auth.reset_title')}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <PasswordField
                register={register}
                name="password"
                placeholder={t('auth.password')}
                required
                error={errors.password}
                />
                <PasswordField
                register={register}
                name="passwordConfirm"
                placeholder={t('auth.password_confirm')}
                required
                error={errors.passwordConfirm}
                validate={(v) => v === watch('password') || t('errors.password_mismatch')}
                />
                <button className="btn btn-primary w-full">{t('auth.reset')}</button>
            </form>
        </div>
    </div>
  );
}