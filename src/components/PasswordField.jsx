// src/components/PasswordField.jsx
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordField({
  register,
  name,
  placeholder,
  required,
  error,
  validate,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="form-control w-full">
      <div className="label">
        <span className="label-text">
          {placeholder}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
      </div>
      <div className="relative">
      <input
        {...register(name, { required, ...(validate && { validate }) })}
        type={visible ? 'text' : 'password'}
        className="input input-bordered w-full pr-12"
        />

        <button
            type="button"
            className="absolute inset-y-0 right-0 px-3 flex items-center bg-base-100 border-l border-base-300 z-10"
            onClick={() => setVisible(!visible)}
            >
            {visible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {error && <p className="text-xs text-error mt-1">{error.message}</p>}
    </label>
  );
}