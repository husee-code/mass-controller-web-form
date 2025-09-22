import { useState, useEffect } from "react";
import SettingsSection from "./pages/SettingsSection.jsx";

function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return Object.fromEntries(params.entries());
}

export default function App() {
    const [page, setPage] = useState("");
    const [data, setData] = useState({});
    useEffect(() => {
        if (window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();   // говорим Telegram, что приложение готово
            tg.expand();  // разворачиваем WebApp на весь экран
        }
        console.log(getQueryParams());
        setData(JSON.parse(getQueryParams().data ?? "{}"))
        setPage(getQueryParams().page);
    }, []);

    return <>
        {page === "CreateFlowPage" && <SettingsSection title="Настройки" isEditing={false} data={data}/>}
        {page === "EditFlowPage" && <SettingsSection title={`Изменить Flow #${data.flow_id}`} isEditing={true} data={data}/>}
    </>
}
