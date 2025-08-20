// src/pages/auth/Signup.jsx
import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { countriesService } from '../../services/countriesService';
import { townsService } from '../../services/townsService';
import AutocompleteInput from '../../components/AutocompleteInput';
import FormField from '../../components/FormField';
import FilePreviewInput from '../../components/FilePreviewInput';
import PasswordField from '../../components/PasswordField';
import { uploadFilesService } from '../../services/uploadFilesService';

export default function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  /* -------------------------------------------------
     Pays & Villes
  -------------------------------------------------- */
  const { data: resCountries } = useQuery({
    queryKey: ['countries', { isActive: true, limit: -1 }],
    queryFn: () => countriesService.getCountries({ isActive: true, limit: -1 }),
  });
  const countries = resCountries?.data?.result?.data || [];

  const [countrySearch, setCountrySearch] = useState('');
  const [townSearch, setTownSearch] = useState('');
  const [showCountryList, setShowCountryList] = useState(false);
  const [showTownList, setShowTownList] = useState(false);

  const selectedCountryId = watch('countryId');
  const selectedTownId    = watch('townId');
  const [photoFile, setPhotoFile] = useState(null);   // le File sélectionné
  const [photoUrl,  setPhotoUrl]  = useState('');     // l’URL retournée

  /* Villes du pays sélectionné */
  const { data: resTowns, isLoading: townsLoading } = useQuery({
    queryKey: ['towns', {
      countryId: selectedCountryId,
      isActive: true,
      limit: -1,
    }],
    queryFn: () =>
      townsService.getTowns({
        countryId: selectedCountryId,
        isActive: true,
        limit: -1,
      }),
    enabled: !!selectedCountryId,
  });
  const towns = resTowns?.data?.result?.data || [];

  /* -------------------------------------------------
     Autocomplétion
  -------------------------------------------------- */
  const filteredCountries = useMemo(
    () => countries.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase())),
    [countries, countrySearch]
  );
  const filteredTowns = useMemo(
    () => towns.filter(t => t.name.toLowerCase().includes(townSearch.toLowerCase())),
    [towns, townSearch]
  );

  const selectCountry = (c) => {
    setValue('countryId', c.id);
    setValue('townId', ''); // reset ville
    setCountrySearch(c.name);
    setShowCountryList(false);
  };
  const selectTown = (t) => {
    setValue('townId', t.id);
    setTownSearch(t.name);
    setShowTownList(false);
  };
  /* -------------------------------------------------
      Upload File Mutation
    -------------------------------------------------- */
  const uploadMutation = useMutation({
    mutationFn: (file) => {
      const fd = new FormData();
      fd.append('files', file);
      return uploadFilesService.createFiles(fd);
    },
  });

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

  const onSubmit = async (values) => {
    // Cloner pour éviter de modifier directement
    let finalPhotoUrl = '';
    if (photoFile) {
      try {
        const res = await uploadMutation.mutateAsync(photoFile);
        finalPhotoUrl = res?.data?.result?.[0]?.url || '';
      } catch (err) {
        // <-- ici on log le vrai problème
        console.error('Upload photo →', err.response?.data || err.message);
        toast.error(
          err.response?.data?.message || err.message || 'Erreur inconnue'
        );
        return;
      }
    }

    // 2. préparation du payload
    const payload = {
      ...values,
      ...(finalPhotoUrl && { photo: finalPhotoUrl }),
    };
  
    // Nettoyage : supprimer les champs optionnels si vides
    if (!payload.username?.trim()) delete payload.username;
    if (!payload.firstName?.trim()) delete payload.firstName;
    if (!payload.email?.trim()) delete payload.email;
    if (!payload.photo?.trim()) delete payload.photo;
  
    // On n’envoie pas la confirmation
    delete payload.passwordConfirm;
  
    // On n’a pas besoin du countryId (helper frontend)
    delete payload.countryId;
  
    signupMutation.mutate(payload);
  };
  

  /* -------------------------------------------------
     Rendu
  -------------------------------------------------- */
  return (
    <div className="max-w-xl mx-auto mt-10 card bg-base-100 shadow-lg transition-colors duration-300">
      <div className="card-body">
        <h2 className="card-title text-primary">{t('nav.signup')}</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* username (optionnel) */}
          <input
            {...register('username')}
            placeholder={t('auth.username')}
            className="input input-bordered w-full"
          />

          {/* lastName (obligatoire) */}
          <FormField  required error={errors.lastName}>
            <input
              {...register('lastName', { required: t('errors.required') })}
              placeholder={t('auth.lastName')}
              className="input input-bordered w-full"
            />
          </FormField>

          {/* firstName (optionnel) */}
          <input
            {...register('firstName')}
            placeholder={t('auth.firstName')}
            className="input input-bordered w-full"
          />

          {/* email (optionnel) */}
          <input
            type="email"
            {...register('email')}
            placeholder={t('auth.email')}
            className="input input-bordered w-full"
          />

          {/* phone (obligatoire) */}
          <FormField required error={errors.phone}>
            <input
              type="tel"
              {...register('phone', { required: t('errors.required') })}
              placeholder={t('auth.phone')}
              className="input input-bordered w-full"
            />
          </FormField>

          {/* gender (obligatoire) */}
          <select
            {...register('gender', { required: t('errors.required') })}
            className="select select-bordered w-full mt-6"
          >
            <option value="">{t('auth.choose_gender')}</option>
            <option value="MALE">{t('gender.male')}</option>
            <option value="FEMALE">{t('gender.female')}</option>
            {/* <option value="OTHER">{t('gender.other')}</option> */}
          </select>

          {/* Pays (autocomplétion) */}
          <FormField required  error={errors.countryId}>
            <AutocompleteInput
              placeholder={t('auth.choose_country')}
              items={countries}
              onSelect={(id, name) => {
                setValue('countryId', id);
                setValue('townId', ''); // reset ville
              }}
            />
          </FormField>

          {/* Villes (autocomplétion, dépend du pays) */}
          
          <FormField required error={errors.townId}>
            <AutocompleteInput
              placeholder={t('auth.choose_town')}
              items={towns}
              disabled={!selectedCountryId}
              onSelect={(id, name) => setValue('townId', id)}
            />
          </FormField>

          <FormField required error={errors.password}>
            <PasswordField
              register={register}
              name="password"
              placeholder={t('auth.password')}
              required={t('errors.required')}
              error={errors.password}
            />
          </FormField>

          <FormField required error={errors.passwordConfirm}>
            <PasswordField
              register={register}
              name="passwordConfirm"
              placeholder={t('auth.password_confirm')}
              required={t('errors.required')}
              error={errors.passwordConfirm}
              validate={(value) => value === watch('password') || t('errors.password_mismatch')}
            />
          </FormField>

          {/* photo (optionnel) */}
          <FormField error={errors.photo}>
            <FilePreviewInput
              label={t('auth.choose_photo')}
              onFileChange={setPhotoFile}
            />
          </FormField>
          <input type="hidden" {...register('photo')} />

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