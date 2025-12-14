import './fancy-label.css'

export default function FancyLabel({ children, text, postText, style }) {
    return <div className="fancy-label-wrapper">
        <p className='fancy-label'>{text}</p>
        <div className="fancy-label-content-wrapper" style={style}>
            {children}
        </div>
        <p className='fancy-label-post-text'>{postText}</p>
    </div>
}