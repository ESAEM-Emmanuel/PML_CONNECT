// src/components/FilePreviewInput.jsx
import { useRef, useState } from 'react';

// FilePreviewInput.jsx
export default function FilePreviewInput({ onFileChange, label }) {
    const [preview, setPreview] = useState(null);
    const inputRef = useRef();
  
    const handleChange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setPreview(URL.createObjectURL(file));
      onFileChange(file);
    };
  
    return (
      <div className="form-control w-full">
        <button
          type="button"
          className="btn btn-outline w-full h-32 flex items-center justify-center"
          onClick={() => inputRef.current?.click()}
        >
          {preview ? (
            <img
              src={preview}
              alt="preview"
              className="h-full max-h-28 object-cover rounded"
            />
          ) : (
            <span className="text-sm">{label}</span>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
      </div>
    );
  }