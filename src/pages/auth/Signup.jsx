// import { useForm } from 'react-hook-form'
// import { useAuth } from '../../context/AuthContext'
// import { useTranslation } from 'react-i18next'
// import { Link, useNavigate } from 'react-router-dom'

// export default function Signup() {
//   const { register, handleSubmit } = useForm()
//   const { signup } = useAuth()
//   const { t } = useTranslation()
//   const navigate = useNavigate()

//   const onSubmit = async (values) => {
//     await signup(values)
//     navigate('/login')
//   }

//   return (
//     <div className="max-w-md mx-auto mt-10 card bg-base-100 shadow-lg transition-colors duration-300">
//       <div className="card-body">
//         <h2 className="card-title text-primary">{t('nav.signup')}</h2>
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//           <input {...register('name', { required: true })} placeholder={t('auth.name')} className="input input-bordered w-full" />
//           <input {...register('email', { required: true })} placeholder={t('auth.email')} className="input input-bordered w-full" />
//           <input {...register('password', { required: true })} type="password" placeholder={t('auth.password')} className="input input-bordered w-full" />
//           <input {...register('passwordConfirm', { required: true })} type="password" placeholder={t('auth.password_confirm')} className="input input-bordered w-full" />
//           <button className="btn btn-primary w-full">{t('auth.signup')}</button>
//         </form>
//         <div className="mt-2 text-sm">
//           <Link to="/login" className="link">{t('auth.have_account')} {t('auth.login')}</Link>
//         </div>
//       </div>
//     </div>
//   )
// }

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { countriesService } from '../../services/countriesService';
import { townsService } from '../../services/townsService';

export default function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  /* -------------------------------------------------
     Pays & Villes
  -------------------------------------------------- */
  // Pays
  const { data: resCountries } = useQuery({
    queryKey: ['countries', { isActive: true, limit: -1 }],
    queryFn: () => countriesService.getCountries({ isActive: true, limit: -1 }),
  });
  const countries = resCountries?.data?.result?.data || [];

  // Villes
  const selectedCountryId = watch('countryId');
  const { data: resTowns, isLoading: townsLoading } = useQuery({
    queryKey: ['towns', { countryId: selectedCountryId, isActive: true, limit: -1 }],
    queryFn: () => townsService.getTowns({ countryId: selectedCountryId, isActive: true, limit: -1 }),
    enabled: !!selectedCountryId,
  });
  const towns = resTowns?.data?.result?.data || [];


  /* -------------------------------------------------
     Inscription
  -------------------------------------------------- */
  const signupMutation = useMutation({
    mutationFn: authService.signup,
    onSuccess: () => {
      toast.success(t('auth.signup_success'));
      reset();
      navigate('/login');
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || err.message),
  });

  // const onSubmit = (values) => signupMutation.mutate(values);
  const onSubmit = (values) => {
  const payload = { ...values };
  // Si la chaîne est vide, on retire la clé
  if (!payload.photo?.trim()) {
    delete payload.photo;
  }
  signupMutation.mutate(payload);
};

  /* -------------------------------------------------
     Rendu
  -------------------------------------------------- */
  return (
    <div className="max-w-xl mx-auto mt-10 card bg-base-100 shadow-lg transition-colors duration-300">
      <div className="card-body">
        <h2 className="card-title text-primary">{t('nav.signup')}</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* username */}
          <input
            {...register('username', { required: t('errors.required') })}
            placeholder={t('auth.username')}
            className="input input-bordered w-full"
          />
          {errors.username && <p className="text-xs text-error">{errors.username.message}</p>}

          {/* lastName */}
          <input
            {...register('lastName', { required: t('errors.required') })}
            placeholder={t('auth.lastName')}
            className="input input-bordered w-full"
          />

          {/* firstName */}
          <input
            {...register('firstName', { required: t('errors.required') })}
            placeholder={t('auth.firstName')}
            className="input input-bordered w-full"
          />

          {/* email */}
          <input
            type="email"
            {...register('email', { required: t('errors.required') })}
            placeholder={t('auth.email')}
            className="input input-bordered w-full"
          />

          {/* phone */}
          <input
            type="tel"
            {...register('phone')}
            placeholder={t('auth.phone')}
            className="input input-bordered w-full"
          />

          {/* gender */}
          <select {...register('gender')} className="select select-bordered w-full">
            <option value="MALE">{t('gender.male')}</option>
            <option value="FEMALE">{t('gender.female')}</option>
            <option value="OTHER">{t('gender.other')}</option>
          </select>

          {/* Pays actifs */}
          <select
            {...register('countryId', { required: t('errors.required') })}
            className="select select-bordered w-full"
            onChange={() => refetchTowns()} // recharge les villes si on change de pays
          >
            <option value="">{t('auth.choose_country')}</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Villes actives du pays sélectionné */}
          <select
            {...register('townId', { required: t('errors.required') })}
            className="select select-bordered w-full"
            disabled={!selectedCountryId || townsLoading}
          >
            <option value="">
              {townsLoading ? t('loading') : t('auth.choose_town')}
            </option>
            {towns.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* photo (optionnel) */}
          <input
            {...register('photo')}
            placeholder={t('auth.photo_url')}
            className="input input-bordered w-full"
          />

          <button
            type="submit"
            disabled={signupMutation.isLoading}
            className="btn btn-primary w-full"
          >
            {signupMutation.isLoading ? t('loading') : t('auth.signup')}
          </button>
        </form>

        <div className="mt-2 text-sm">
          <Link to="/login" className="link">
            {t('auth.have_account')} {t('auth.login')}
          </Link>
        </div>
      </div>
    </div>
  );
}