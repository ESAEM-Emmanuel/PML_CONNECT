import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import API from '../../services/api'
import { useTranslation } from 'react-i18next'

export default function CountryForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { register, handleSubmit, reset } = useForm()
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    const load = async () => {
      if (isEdit) {
        const { data } = await API.get(`/countries/${id}`)
        reset(data)
      }
    }
    load()
  }, [id])

  const onSubmit = async (values) => {
    if (isEdit) await API.put(`/countries/${id}`, values)
    else await API.post('/countries', values)
    navigate('/countries')
  }

  return (
    <div className="card bg-base-100 shadow max-w-xl mx-auto">
      <div className="card-body space-y-4">
        <h2 className="card-title">{isEdit ? t('crud.update') : t('crud.create')} - {t('country.title')}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input {...register('name', { required: true })} placeholder={t('country.name')} className="input input-bordered w-full" />
          <input {...register('code', { required: true })} placeholder={t('country.code')} className="input input-bordered w-full" />
          <div className="flex gap-2">
            <button className="btn btn-primary">{t('crud.save')}</button>
            <button type="button" onClick={() => navigate(-1)} className="btn">{t('crud.cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}