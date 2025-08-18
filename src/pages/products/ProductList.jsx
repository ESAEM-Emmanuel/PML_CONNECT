import { useEffect, useState } from 'react'
import API from '../../services/api'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function ProductList() {
  const [items, setItems] = useState([])
  const { t } = useTranslation()

  const fetchData = async () => {
    const { data } = await API.get('/products')
    setItems(data)
  }

  useEffect(() => { fetchData() }, [])

  const remove = async (id) => {
    if (!confirm(t('crud.confirm_delete'))) return
    await API.delete(`/products/${id}`)
    fetchData()
  }

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <div className="flex justify-between items-center">
          <h2 className="card-title">{t('product.title')}</h2>
          <Link to="/products/new" className="btn btn-primary">{t('crud.create')}</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>{t('product.name')}</th>
                <th>{t('product.price')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.price}</td>
                  <td className="flex gap-2">
                    <Link to={`/products/${p.id}`} className="btn btn-sm">{t('crud.update')}</Link>
                    <button onClick={() => remove(p.id)} className="btn btn-sm btn-error">{t('crud.delete')}</button>
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