// src/components/CrudModal.jsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import AutocompleteInput from './AutocompleteInput';
import PasswordField from './PasswordField';
import FilePreviewInput from './FilePreviewInput';

export default function CrudModal({
    isOpen,
    onClose,
    title,
    fields,
    viewFields,
    initialData = {},
    onSubmit,
    mode,
}) {
    const { register, handleSubmit, reset, setValue } = useForm();

    useEffect(() => {
        reset(initialData);
    }, [initialData, reset]);

    if (!isOpen) return null;

    const isView = mode === 'view';

    const getFieldValue = (item, field) => {
        if (typeof field.accessor === 'function') {
            return field.accessor(item);
        }
        return item[field.name];
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-lg">
                <button onClick={onClose} className="btn btn-sm btn-circle absolute right-2 top-2">
                    <X />
                </button>
                <h3 className="font-bold text-lg mb-4">{title}</h3>

                {/* Formulaire pour les modes 'create' et 'edit' */}
                {!isView && (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {fields.map(({ name, label, type, required, options, autocompleteProps, customProps }) => (
                            <div key={name} className="form-control w-full mb-2">
                                {/* Afficher le label du champ */}
                                <label className="label">
                                    <span className="label-text">
                                        {label}
                                        {required && <span className="text-red-500 ml-1">*</span>}
                                    </span>
                                </label>

                                {/* Rendu conditionnel des différents types de champs */}
                                {type === 'autocomplete' ? (
                                    <AutocompleteInput
                                        placeholder={label}
                                        required={required}
                                        {...autocompleteProps}
                                        onSelect={(id, selectedName) => {
                                            setValue(name, id);
                                            if (autocompleteProps.onSelect) {
                                                autocompleteProps.onSelect(id, selectedName);
                                            }
                                        }}
                                    />
                                ) : type === 'select' ? (
                                    <select {...register(name, { required })} className="select select-bordered w-full">
                                        <option value="">{`-- Choisir un ${label.toLowerCase()} --`}</option>
                                        {options.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                ) : type === 'password' ? (
                                    <PasswordField
                                        register={register}
                                        name={name}
                                        placeholder={label}
                                        required={required}
                                        {...customProps}
                                    />
                                ) : type === 'file' ? (
                                    <FilePreviewInput
                                        label={label}
                                        onFileChange={(file) => setValue(name, file)}
                                    />
                                ) : (
                                    <input
                                        {...register(name, { required })}
                                        type={type}
                                        placeholder={label}
                                        className="input input-bordered w-full"
                                    />
                                )}
                            </div>
                        ))}
                        <div className="modal-action">
                            <button type="submit" className="btn btn-primary">
                                {mode === 'create' ? 'Créer' : 'Modifier'}
                            </button>
                            <button type="button" onClick={onClose} className="btn">
                                Annuler
                            </button>
                        </div>
                    </form>
                )}

                {/* Affichage des détails pour le mode 'view' */}
                {isView && initialData && (
                    <div className="py-4">
                        {viewFields.map((field) => (
                            <p key={field.name} className="mb-2">
                                <strong>{field.label} :</strong> {getFieldValue(initialData, field)}
                            </p>
                        ))}
                    </div>
                )}
                
                {isView && (
                    <div className="modal-action">
                        <button onClick={onClose} className="btn">Fermer</button>
                    </div>
                )}
            </div>
        </div>
    );
}