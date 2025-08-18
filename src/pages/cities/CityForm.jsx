import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import API from '../../services/api'
import { useTranslation } from 'react-i18next'

export default function CityForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { register, handleSubmit, reset } = useForm()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [countries, setCountries] = useState([])

  useEffect(() => {
    API.get('/countries').then(({ data }) => setCountries(data))
  }, [])

  useEffect(() => {
    const load = async () => {
      if (isEdit) {
        const { data } = await API.get(`/cities/${id}`)
        reset(data)
      }
    }
    load()
  }, [id])

  const onSubmit = async (values) => {
    if (isEdit) await API.put(`/cities/${id}`, values)
    else await API.post('/cities', values)
    navigate('/cities')
  }

  return (
    <div className="card bg-base-100 shadow max-w-xl mx-auto">
      <div className="card-body space-y-4">
        <h2 className="card-title">{isEdit ? t('crud.update') : t('crud.create')} - {t('city.title')}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input {...register('name', { required: true })} placeholder={t('city.name')} className="input input-bordered w-full" />
          <select {...register('countryId', { required: true })} className="select select-bordered w-full">
            <option value="">{t('city.country')}</option>
            {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="flex gap-2">
            <button className="btn btn-primary">{t('crud.save')}</button>
            <button type="button" onClick={() => navigate(-1)} className="btn">{t('crud.cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}