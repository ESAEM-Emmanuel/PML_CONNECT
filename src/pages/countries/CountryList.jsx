import { useEffect, useState } from 'react'
import API from '../../services/api'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function CountryList() {
  const [items, setItems] = useState([])
  const { t } = useTranslation()

  const fetchData = async () => {
    const { data } = await API.get('/countries')
    setItems(data)
  }

  useEffect(() => { fetchData() }, [])

  const remove = async (id) => {
    if (!confirm(t('crud.confirm_delete'))) return
    await API.delete(`/countries/${id}`)
    fetchData()
  }

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <div className="flex justify-between items-center">
          <h2 className="card-title">{t('country.title')}</h2>
          <Link to="/countries/new" className="btn btn-primary">{t('crud.create')}</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>{t('country.name')}</th>
                <th>{t('country.code')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.code}</td>
                  <td className="flex gap-2">
                    <Link to={`/countries/${c.id}`} className="btn btn-sm">{t('crud.update')}</Link>
                    <button onClick={() => remove(c.id)} className="btn btn-sm btn-error">{t('crud.delete')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}