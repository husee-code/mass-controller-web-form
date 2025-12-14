import { createPortal } from "react-dom";
import './set-value-portal.css'

export default function SetValuePortal({children, onClose}) {
    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>,
        document.getElementById("modal-root")
    );
}