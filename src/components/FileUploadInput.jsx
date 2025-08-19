// src/components/FileUploadInput.jsx
import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { uploadFilesService } from '../services/uploadFilesService';
import toast from 'react-hot-toast';

export default function FileUploadInput({ onUploaded, accept = 'image/*' }) {
  const [preview, setPreview] = useState(null);
  const inputRef = useRef();

  const uploadMutation = useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append('files', file);
      return uploadFilesService.createFiles(formData);
    },
    onSuccess: (res) => {
      const url = res?.data?.result?.[0]?.url;
      if (url) {
        onUploaded(url);
        toast.success('Fichier envoyé');
      }
    },
    onError: () => toast.error('Échec envoi'),
  });

  const onChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    uploadMutation.mutate(file);
  };

  return (
    <div className="form-control w-full">
      <button
        type="button"
        className="btn btn-outline w-full"
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="preview" className="h-16 object-cover rounded" />
        ) : (
          'Choisir une photo'
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onChange}
      />
    </div>
  );
}