import './fancy-toggle.css'

export default function FancyToggle({ value, onChange }) {
    return <label className="form-switch">
        <input type="checkbox" onChange={onChange} checked={value} />
        <i></i>
    </label>
}