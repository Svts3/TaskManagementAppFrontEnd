export default function Input({ name, id, type, required, register, errors }) {
    return (
        <div className="input-container">
            <input
                {...register(name)}
                id={id}
                type={type}
                required={required}
                placeholder={name.replace("-", " ").toUpperCase()}
                className={`input-field ${errors[name] ? "input-error" : ""}`}
            />
            {errors[name] && (
                <p className="error-text">{errors[name].message}</p>
            )}
        </div>
    );
}