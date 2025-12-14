import './fancy-input.css'

export default function FancyInput({ value, name, onChange, pattern, inputMode, required, type, style}) {
    return <input
        className="fancy-input"
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        pattern={pattern}
        required={required}
        inputMode={inputMode}
        style={style}
    />
}