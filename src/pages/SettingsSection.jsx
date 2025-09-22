import { useState, useEffect } from "react";

function intervalSecondsToString(seconds) {
    if (typeof seconds !== 'number' || seconds < 0) {
        return '00:00';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
}

function intervalStringToSeconds(s) {
    // Проверяем валидность входных данных
    if (typeof s !== 'string' || !s) {
        return 0;
    }

    // Разделяем строку по двоеточию
    const parts = s.split(':');

    // Проверяем корректность формата
    if (parts.length < 2) {
        return 0;
    }

    // Преобразуем части в числа
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;

    // Вычисляем общее количество секунд
    return hours * 3600 + minutes * 60;
}

export default function SettingsSection({ title, isEditing, data }) {
    const [form, setForm] = useState({
        page: isEditing ? "EditFlowPage" : "CreateFlowPage",
        flowId: data.flow_id,
        channel: "",
        sessionAmount: "",
        interval: "00:00",
        unsubscribeInterval: {value: 0, unit: "days"},
        startData: {type: "timer", value: "00:00"},  // timer | datetime
    });

    useEffect(() => {
        console.log(data)
        setForm((prev) => ({
            ...prev,
            sessionAmount: data?.sessionAmount || prev.sessionAmount,
            interval: intervalSecondsToString(data?.interval) || prev.interval,
            unsubscribeInterval: data?.unsubscribeInterval || prev.unsubscribeInterval
        }));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleUnsubscribeChange = (e) => {
        const { name, value } = e.target;
        console.log({ name, value });
        setForm((prev) => ({
            ...prev,
            unsubscribeInterval: { ...prev.unsubscribeInterval, [name]: value },
        }));
    };

    const handleSubmit = (e) => {
        console.log(form);
        e.preventDefault();
        let result = {
            ...form,
            interval: intervalStringToSeconds(form.interval),
        }
        if (form.startData.type === "timer") {
            result.startData.value = intervalStringToSeconds(form.startData.value);
        }
        const payload = JSON.stringify(result);
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.sendData(payload);
            window.Telegram.WebApp.close();
        } else {
            console.log("Payload:", payload);
        }
    };
    return <div style={{padding: "20px", fontFamily: "sans-serif"}}>
        <h2>{title}</h2>
        <form onSubmit={handleSubmit} style={{display: "grid", gap: "15px"}}>
            {!isEditing ?
                <label>
                    Ссылка на канал:
                    <input
                        type="url"
                        name="channel"
                        value={form.channel}
                        onChange={handleChange}
                        required
                    />
                </label> :
                <p>
                    Ссылка на канал: <a href={data.channel} target="_blank">{data.channel}</a>
                </p>
            }

            <label>
                Количество: {data.page === "EditFlowPage" ? `${data.completed} /`: ""}
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="sessionAmount"
                    value={form.sessionAmount}
                    onChange={handleChange}
                    style={{width:'3rem', marginLeft:'0.5rem'}}
                />
            </label>

            <label>
                Интервал:
                <input
                    type="time"
                    name="interval"
                    value={form.interval}
                    onChange={handleChange}
                />

            </label>

            <label>
                Интервал отписки:
                <div style={{display: "flex", gap: "8px"}}>
                    <input
                        type="number"
                        name="value"
                        value={form.unsubscribeInterval.value ?? 0}
                        onChange={handleUnsubscribeChange}
                        placeholder="Число"
                    />
                    <select
                        name="unit"
                        value={form.unsubscribeInterval.unit}
                        onChange={handleUnsubscribeChange}
                    >
                        <option value="minutes">минут</option>
                        <option value="hours">часов</option>
                        <option value="days">дней</option>
                    </select>
                </div>
            </label>

            <fieldset style={{border: "1px solid #ccc", padding: "10px"}}>
                <legend>Время старта</legend>
                <label>
                    <input
                        type="radio"
                        name="startMode"
                        value="timer"
                        checked={form.startData.type === "timer"}
                        onChange={(value)=>{
                            setForm((prev) => ({
                                ...prev, startData: {type: "timer", value},
                            }));
                        }}
                    />
                    Таймер
                </label>

                {form.startData.type === "timer" && (
                    <input
                        type="time"
                        name="startTimer"
                        value={form.startData.value ?? "00:00"}
                        onChange={(e)=>{
                            setForm((prev) => ({
                                ...prev, startData: {type: "timer", value: e.target.value},
                            }));
                        }}
                    />
                )}

                <label>
                    <input
                        type="radio"
                        name="startMode"
                        value="datetime"
                        checked={form.startData.type === "datetime"}
                        onChange={()=>{
                            setForm((prev) => ({
                                ...prev, startData: {type: "datetime", value: null},
                            }));
                        }}
                    />
                    Конкретная дата
                </label>
                {form.startData.type === "datetime" && (
                    <input
                        type="datetime-local"
                        name="startDateTime"
                        value={form.startData.value}
                        onChange={(e)=>{
                            setForm((prev) => ({
                                ...prev, startData: {type: "datetime", value:e.target.value},
                            }));
                        }}
                    />
                )}
            </fieldset>

            <button type="submit">Отправить</button>
        </form>
    </div>
}
