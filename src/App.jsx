// src/App.jsx
import { useState, useEffect } from "react";

function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return Object.fromEntries(params.entries());
}

export default function App() {
    const [form, setForm] = useState({
        channel: "",
        count: "",
        interval: "",
        unsubscribe: { value: "", unit: "days" },
        startMode: "timer", // timer | datetime
        startTimer: "",
        startDateTime: "",
    });

    useEffect(() => {
        if (window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();   // говорим Telegram, что приложение готово
            tg.expand();  // разворачиваем WebApp на весь экран
        }
        const query = getQueryParams();
        setForm((prev) => ({
            ...prev,
            channel: query.channel || prev.channel,
            count: query.count || prev.count,
            interval: query.interval || prev.interval,
            unsubscribe: {
                value: query.unsubscribe_value || prev.unsubscribe.value,
                unit: query.unsubscribe_unit || prev.unsubscribe.unit,
            },
        }));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleUnsubscribeChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            unsubscribe: { ...prev.unsubscribe, [name]: value },
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = JSON.stringify(form);
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.sendData(payload);
            window.Telegram.WebApp.close();
        } else {
            console.log("Payload:", payload);
        }
    };

    return (
        <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
            <h2>Настройки</h2>
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "15px" }}>
                <label>
                    Ссылка на канал:
                    <input
                        type="url"
                        name="channel"
                        value={form.channel}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Количество:
                    <input
                        type="number"
                        name="count"
                        value={form.count}
                        onChange={handleChange}
                    />
                </label>

                <label>
                    Интервал:
                    <input
                        type="number"
                        name="interval"
                        value={form.interval}
                        onChange={handleChange}
                    />
                </label>

                <label>
                    Интервал отписки:
                    <div style={{ display: "flex", gap: "8px" }}>
                        <input
                            type="number"
                            name="value"
                            value={form.unsubscribe.value}
                            onChange={handleUnsubscribeChange}
                            placeholder="Число"
                        />
                        <select
                            name="unit"
                            value={form.unsubscribe.unit}
                            onChange={handleUnsubscribeChange}
                        >
                            <option value="minutes">минут</option>
                            <option value="hours">часов</option>
                            <option value="days">дней</option>
                        </select>
                    </div>
                </label>

                <fieldset style={{ border: "1px solid #ccc", padding: "10px" }}>
                    <legend>Время старта</legend>
                    <label>
                        <input
                            type="radio"
                            name="startMode"
                            value="timer"
                            checked={form.startMode === "timer"}
                            onChange={handleChange}
                        />
                        Таймер
                    </label>
                    {form.startMode === "timer" && (
                        <input
                            type="number"
                            name="startTimer"
                            value={form.startTimer}
                            onChange={handleChange}
                            placeholder="Минут"
                        />
                    )}

                    <label>
                        <input
                            type="radio"
                            name="startMode"
                            value="datetime"
                            checked={form.startMode === "datetime"}
                            onChange={handleChange}
                        />
                        Конкретная дата
                    </label>
                    {form.startMode === "datetime" && (
                        <input
                            type="datetime-local"
                            name="startDateTime"
                            value={form.startDateTime}
                            onChange={handleChange}
                        />
                    )}
                </fieldset>

                <button type="submit">Отправить</button>
            </form>
        </div>
    );
}
