import { useState, useEffect } from "react";
import SettingsSection from "./pages/SettingsSection.jsx";
import SelectSessionsPage from "./pages/SelectSessionsPage.jsx";
import Title from "./components/Title.jsx";

function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return Object.fromEntries(params.entries());
}

export default function App() {
    const [page, setPage] = useState("");
    const [title, setTitle] = useState("");
    const [data, setData] = useState({});
    useEffect(() => {
        if (window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();   // говорим Telegram, что приложение готово
            tg.expand();  // разворачиваем WebApp на весь экран
        }
        setData(JSON.parse(getQueryParams().data ?? "{}"))
        setPage(getQueryParams().page);

        if (page === "CreateFlowPage") setTitle("Создать процесс подписки");
        else if (page === "EditFlowPage") setTitle(`Изменить Flow #${data.flow_id}`);
        else if (page === "SelectSessionsPage") setTitle("Выбор аккаунтов");
    }, [page, data.flow_id]);

    return <>
        <Title>{title}</Title>
        {page === "CreateFlowPage" && <SettingsSection isEditing={false} data={data}/>}
        {page === "EditFlowPage" && <SettingsSection isEditing={true} data={data}/>}
        {page === "SelectSessionsPage" && <SelectSessionsPage data={data}/>}
    </>
}
