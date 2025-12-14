import "./fancy-block.css"
import { ReactComponent as ChevronRight } from '../assets/ChevronRight.svg';

export default function FancyBlock({ children }) {
    return <div className="fancy-block">
        {children}
    </div>
}
