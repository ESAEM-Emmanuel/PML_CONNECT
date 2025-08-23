// src/components/ExportToExcel.jsx
import React, { useMemo } from 'react';
import { CSVLink } from 'react-csv';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';


const ExportToExcel = ({ data, filename, headers, children }) => {
  // Utilise useMemo pour mémoriser les en-têtes calculés si 'headers' n'est pas fourni
  const { t } = useTranslation();
  const csvHeaders = useMemo(() => {
    if (headers && headers.length > 0) {
      return headers;
    }
    if (data && data.length > 0) {
      return Object.keys(data[0]).map(key => ({
        label: key.charAt(0).toUpperCase() + key.slice(1),
        key: key,
      }));
    }
    return [];
  }, [data, headers]);

  // N'affiche rien si les données sont vides
  if (!data || data.length === 0) {
    return null;
  }

  // Le `CSVLink` se comporte comme un lien. On utilise le `children` pour le contenu du bouton.
  return (
    <CSVLink
      data={data}
      headers={csvHeaders}
      filename={filename}
      className="btn btn-secondary"
      target="_blank"
    >
      {t('crud.dawnload')}
      {children || <Download size={24} />}
    </CSVLink>
  );
};

export default ExportToExcel;