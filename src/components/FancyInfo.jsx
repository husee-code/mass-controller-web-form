export default function FancyInfo({ children }) {
    return <>
        <div className="title-wrapper">
            <h1 className="title">{children}</h1>
        </div>
    </>
}