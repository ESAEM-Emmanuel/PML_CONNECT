// src/components/FormField.jsx
// src/components/FormField.jsx
export default function FormField({ label, required, error, children }) {
    const showLabel = label || required;
    return (
      <label className={`form-control w-full ${!showLabel ? 'mt-4' : ''}`}>
        {showLabel && (
          <div className="label">
            <span className="label-text">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </span>
          </div>
        )}
        {children}
        {error && <p className="text-xs text-error mt-1">{error.message}</p>}
      </label>
    );
  }