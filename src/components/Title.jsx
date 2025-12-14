import "./title.css"

export default function Title({ children }) {
    return <div className="title-wrapper">
            <h1 className="title">{children}</h1>
    </div>

}