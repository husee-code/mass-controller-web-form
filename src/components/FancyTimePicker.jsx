import './fancy-time-picker.css'
import {timeDigitsToString} from "../services/functions.js";


export default function FancyTimePicker({ value, name, onChange, pattern, inputMode, required, type}) {
    return <div className="fancy-time-picker-wrapper">
        <span>{timeDigitsToString(value)}</span>
        <input
            className="fancy-time-picker"
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            pattern={pattern}
            required={required}
            inputMode={inputMode}
        />
    </div>
}