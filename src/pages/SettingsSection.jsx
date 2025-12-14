import './SelectSessionsPage.css'
import {useState, useEffect, useRef} from "react";
import FancyLabel from "../components/FancyLabel.jsx";
import FancyInput from "../components/FancyInput.jsx";
import FancyTimePicker from "../components/FancyTimePicker.jsx";
import { ReactComponent as ChevronRight } from '../assets/ChevronRight.svg';
import { ReactComponent as CircleX } from '../assets/CircleX.svg';
import { ReactComponent as CircleCheck } from '../assets/CircleCheck.svg';
import {formatRussianDateTime, getLocalDateTime, timeDigitsToString} from "../services/functions.js";
import '../components/fancy-block.css'
import SetValuePortal from "../components/SetValuePortal.jsx";
import FancyBlock from "../components/FancyBlock.jsx";

function intervalEngToRus(s) {
    if (s === "minutes") return "минут";
    if (s === "hours") return "часов";
    if (s === "days") return "дней";
}

function make_link(channel) {
    if (channel.startsWith("@")) {
        return `https://t.me/${channel.substring(1, channel.length)}/`;
    }
    return channel;
}

function intervalSecondsToString(seconds) {
    if (typeof seconds !== 'number' || seconds < 0) {
        return '00:00';
    }

    const minutes = Math.floor(seconds / 60);
    const _seconds = seconds % 60;

    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = _seconds.toString().padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
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
    const minutes = parseInt(parts[0]) || 0;
    const seconds = parseInt(parts[1]) || 0;

    // Вычисляем общее количество секунд
    return minutes * 60 + seconds;
}

export default function SettingsSection({ isEditing, data }) {
    const formRef = useRef(null);
    const [form, setForm] = useState({
        page: isEditing ? "EditFlowPage" : "CreateFlowPage",
        flowId: data.flow_id,
        channel: "",
        channel_name: "",
        sessionAmount: "",
        interval: "00:00",
        unsubscribeInterval: {value: 0, unit: "days", isFromNow: false},
        startData: {type: "timer", value: "00:00"},  // timer | datetime
        jitter: "00:10",
        offset: 0,
        completed: 0,
        maxAmount: 0,
        config: null
    });

    const [showMore, setShowMore] = useState(false);
    const [startTimeExpanded, setStartTimeExpanded] = useState(false);
    const [isModalOpen, setisModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);


    useEffect(() => {
        setForm((prev) => ({
            ...prev,
            channel: data?.channel || prev.channel,
            sessionAmount: data?.sessionAmount || prev.sessionAmount,
            channel_name: data?.channel_name || prev.channel_name,
            interval: intervalSecondsToString(data?.interval) || prev.interval,
            unsubscribeInterval: data?.unsubscribeInterval || prev.unsubscribeInterval,
            jitter: data.jitter === undefined ? prev.jitter : intervalSecondsToString(data.jitter),
            offset: data?.offset || prev.offset,
            completed: data?.completed || prev.complete,
            maxAmount: data?.maxAmount || prev.maxAmount,
            config: data?.config || prev.config,
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
            unsubscribeInterval: { ...prev.unsubscribeInterval, [name]: value },
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (form.sessionAmount > form.maxAmount) {
            alert(`Максимальное кол-во аккаунтов: ${form.maxAmount}. Указано: ${form.sessionAmount}`)
            return;
        }
        let result = {
            ...form,
            interval: intervalStringToSeconds(form.interval),
            jitter: intervalStringToSeconds(form.jitter),
        }
        if (form.startData.type === "timer") {
            result.startData.value = intervalStringToSeconds(form.startData.value);
        }
        const payload = JSON.stringify(result);

        if (window?.Telegram?.WebApp?.themeParams?.bg_color) {
            window.Telegram.WebApp.sendData(payload);
            setTimeout(() => {
                window.Telegram.WebApp.close();
            }, 200);
        } else {
            setTimeout(() => {
                alert(`No connection to Telegram. Payload:\n${payload}`);
            }, 200);
        }
    };

    const handleInvalid = () => {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred("error");
    }

    const handleUnsubIntervalType = (e) => {
        e.preventDefault();
        setForm((prev) => (
            {
                ...prev,
                unsubscribeInterval: {...prev.unsubscribeInterval, isFromNow: !prev.unsubscribeInterval.isFromNow},
            }
        ));
    }

    const handleConfirmClick = () => {
        setIsConfirmOpen(false);
        window.Telegram.WebApp.HapticFeedback.notificationOccurred("success")
        formRef.current?.requestSubmit();
    }

    return <div className="container">
        {data?.config?.debug && <p>{JSON.stringify(data)}</p>}
        <form
            ref={formRef}
            onSubmit={handleSubmit}
            onInvalid={handleInvalid}
            style={{display: 'grid'}}
        >
            {!isEditing ?
                <FancyLabel text="ССЫЛКА НА КАНАЛ" postText="Если используете username, пишите в виде @username">
                    <FancyInput
                        name="channel"
                        value={form.channel}
                        onChange={handleChange}
                    />

                </FancyLabel> :
                    <FancyBlock>
                        <div className="fancy-block-row">
                            <span>
                             Ссылка на канал
                        </span>
                            <a
                                href={make_link(data.channel)}
                                target="_blank"
                            >
                                {data.channel}
                            </a>
                        </div>

                    </FancyBlock>

            }
            <FancyLabel text="НАЗВАНИЕ ССЫЛКИ">
                <FancyInput
                    name="channel_name"
                    value={form.channel_name}
                    onChange={handleChange}
                    pattern="\S.*"
                />
            </FancyLabel>

            <FancyLabel text="КОЛИЧЕСТВО ПОДПИСОК">
                <FancyInput
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="sessionAmount"
                    value={form.sessionAmount}
                    onChange={handleChange}
                    required={true}
                />
            </FancyLabel>

            <FancyLabel text="ИНТЕРВАЛ">
                <FancyTimePicker
                    type="time"
                    name="interval"
                    value={form.interval}
                    onChange={handleChange}
                    required={true}
                />
            </FancyLabel>

            <FancyLabel text="ИНТЕРВАЛ ОТПИСКИ" style={{display: 'flex'}}>
                <div className="unsub-block">
                    <input
                        type="number"
                        name="value"
                        value={form.unsubscribeInterval.value ?? 0}
                        onChange={handleUnsubscribeChange}
                        placeholder="Число"
                        style={{width: isEditing ? '10%': '50%'}}
                        required
                    />

                    <div className="vertical-line"/>

                    <div
                        className="unsub-interval-select-wrapper"
                        style={{width: isEditing ? '20%': '50%'}}
                    >
                        <span>{intervalEngToRus(form.unsubscribeInterval.unit)}</span>
                        <select
                            className="unsub-interval-select"
                            name="unit"
                            value={form.unsubscribeInterval.unit}
                            onChange={handleUnsubscribeChange}

                        >
                            <option value="minutes">минут</option>
                            <option value="hours">часов</option>
                            <option value="days">дней</option>
                        </select>
                    </div>

                    {isEditing && <>
                        <div className="vertical-line"/>
                        <button
                            className="unsub-interval-type-button"
                            type="button"
                            onClick={handleUnsubIntervalType}
                            style={{flexShrink: 0, width: '65%', padding: 0}}
                        >
                            {form.unsubscribeInterval.isFromNow ? "от этого момента" : "от момента подписки"}
                        </button>
                    </>}
                </div>
            </FancyLabel>

            <div
                className={`fancy-block set-start-time-block${startTimeExpanded ? " expanded" : ""}`}
                style={{
                    height: startTimeExpanded ? (
                        form.startData.type === "timer" ?
                            "4.5rem": "4.5rem"
                    ) : "1.5rem"
            }}
                onClick={()=> {
                    window?.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
                    setStartTimeExpanded((prev) => (!prev));
                }}
            >
                {!startTimeExpanded &&
                    <div
                        className="fancy-block-row"
                        style={{
                            cursor: 'pointer'
                        }}
                    >
                        <span>Время старта</span>
                        <div style={{
                            display: 'flex',
                            marginRight: '-0.5rem'
                        }}>
                            <span style={{color: "var(--tg-theme-section-header-text-color)"}}>
                                {form.startData.type === "timer" && (
                                    form.startData.value === "00:00" ?
                                        "сразу":
                                        `через ${timeDigitsToString(form.startData.value)}`
                                )}
                                {form.startData.type === "datetime" &&
                                    formatRussianDateTime(form.startData.value)
                                }
                            </span>
                            <ChevronRight
                                style={{
                                    color: "var(--tg-theme-section-header-text-color)",
                                }}
                            />
                        </div>
                    </div>
                }

                {startTimeExpanded && <>
                    <div
                        className="fancy-block-row inline-switch"
                    >
                        <div className={`switch-slider ${form.startData.type}`}/>
                        <div
                            style={{
                                display: 'flex',
                                width: "50%",
                                justifyContent: 'center',
                                zIndex: 100
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                window?.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
                                setForm((prev) => ({
                                    ...prev, startData: {type: "timer", value: "00:00"}
                                }));
                            }}
                        >
                            Таймер
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                width: "50%",
                                justifyContent: 'center',
                                zIndex: 100
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                window?.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
                                setForm((prev) => ({
                                    ...prev, startData: {type: "datetime", value: getLocalDateTime(300)}
                                }));
                            }}
                        >
                            Конкретная дата
                        </div>
                    </div>

                    {form.startData.type === "timer" &&
                        <div
                            className="fancy-block-row"
                        >
                            <span>Старт</span>
                            <div
                                style={{
                                    display: 'flex',
                                    marginRight: '-0.5rem',
                                    position: 'relative',
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <input
                                    className="fancy-time-picker"
                                    type="time"
                                    name="startTimer"
                                    value={form.startData.value ?? "00:00"}
                                    onChange={(e) => {
                                        setForm((prev) => ({
                                            ...prev, startData: {type: "timer", value: e.target.value},
                                        }));
                                    }}
                                    style={{zIndex: 100}}
                                />
                                <span
                                    style={{color: "var(--tg-theme-section-header-text-color)"}}
                                >
                                    {
                                        form.startData.value === "00:00" ?
                                            "сразу":
                                            `через ${timeDigitsToString(form.startData.value)}`
                                    }
                                </span>
                                <ChevronRight
                                    style={{
                                        color: "var(--tg-theme-section-header-text-color)",
                                    }}
                                />
                            </div>
                        </div>
                    }

                    {form.startData.type === "datetime" &&
                        <div className="fancy-block-row">
                            <span>Старт</span>
                            <div
                                style={{
                                    display: 'flex',
                                    marginRight: '-0.5rem',
                                    position: 'relative',
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <input
                                    className="fancy-time-picker"
                                    type="datetime-local"
                                    name="startDateTime"
                                    value={form.startData.value}
                                    onChange={(e) => {
                                        setForm((prev) => ({
                                            ...prev, startData: {type: "datetime", value: e.target.value},
                                        }));
                                    }}
                                    style={{zIndex: 100}}
                                />

                                <span
                                    style={{color: "var(--tg-theme-section-header-text-color)"}}
                                >
                                    {formatRussianDateTime(form.startData.value)}
                                </span>
                                <ChevronRight
                                    style={{
                                        color: "var(--tg-theme-section-header-text-color)",
                                    }}
                                />
                            </div>
                        </div>
                    }
                </>}
            </div>

            {showMore && <p className='fancy-label'>ДОПОЛНИТЕЛЬНЫЕ НАСТРОЙКИ</p>}
            <div
                className="fancy-block"
                onClick={() => {
                    setShowMore(!showMore);
                    window?.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
                }}
                style={{
                    height: showMore ? '4.5rem' : '1.5rem'
            }}
            >
                {!showMore &&
                    <div
                        className="fancy-block-row"
                    >
                        <span>Дополнительные настройки</span>
                        <ChevronRight
                            style={{
                                color: "var(--tg-theme-section-header-text-color)",
                                marginRight: '-0.5rem'
                            }}
                        />
                    </div>
                }
                {showMore && <>
                    <div
                        className="fancy-block-row"
                        style={{
                            paddingTop: '0.25rem',
                        }}
                    >
                        <span>Случайная задержка</span>
                        <div
                            style={{
                                display: 'flex',
                                marginRight: '-0.5rem',
                                position: 'relative',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <input
                                className="fancy-time-picker"
                                type="time"
                                name="jitter"
                                value={form.jitter}
                                onChange={handleChange}
                                style={{zIndex: 100}}
                            />
                            <span
                                style={{color: "var(--tg-theme-section-header-text-color)"}}
                            >
                                {
                                    form.jitter === "00:00" ?
                                        "без задержки" :
                                        `${timeDigitsToString(form.jitter)}`
                                }
                            </span>
                            <ChevronRight
                                style={{
                                    color: "var(--tg-theme-section-header-text-color)",
                                }}
                            />
                        </div>
                    </div>

                    <div
                        className="fancy-block-row"
                        style={{
                            paddingTop: '1rem',
                            paddingBottom: '0.5rem',
                        }}
                    >
                        <span>Сдвиг по подпискам</span>
                        <div
                            style={{
                                display: 'flex',
                                marginRight: '-0.5rem',
                                position: 'relative',
                                width: '100px',
                                justifyContent: 'right',
                            }}
                            onClick={(e) => {
                                setisModalOpen(true);
                                e.stopPropagation();
                            }}
                        >
                            <span style={{color: "var(--tg-theme-section-header-text-color)"}}>
                                {form.offset}
                            </span>
                            <ChevronRight
                                style={{
                                    color: "var(--tg-theme-section-header-text-color)"
                                }}
                            />
                        </div>
                    </div>
                </>}
            </div>
            <div className="submit-button-wrapper">
                <button
                    type="button"
                    className="submit-button"
                    onClick={()=>{setIsConfirmOpen(true)}}
                >
                    Отправить
                </button>
                <div className={`confirm-dialog${isConfirmOpen ? ' visible': ''}`}>
                    <p>Подтвердите отправку</p>
                    <div className="icons-wrapper">
                        <CircleX style={{scale: 2.5}} onClick={()=>setIsConfirmOpen(false)} />
                        <CircleCheck
                            style={{scale:2.5, color: "#53900F"}}
                            onClick={handleConfirmClick}
                        />
                    </div>
                </div>
            </div>

        </form>
        {isModalOpen && <SetValuePortal onClose={() => {
            setisModalOpen(false)}}>
            <div className="modal-content-wrapper">
                <div className="modal-header">Сдвиг по подпискам</div>
                <input className="modal-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="offset"
                    value={form.offset}
                    onChange={handleChange}
                />
            </div>
            <div className="modal-buttons-wrapper">
                <button className="modal-button" onClick={()=>setisModalOpen(false)}>Закрыть</button>
                <div className="vertical-line" style={{height: '2.5rem'}}/>
                <button className="modal-button" onClick={()=>setisModalOpen(false)}>Изменить</button>
            </div>
        </SetValuePortal>}
    </div>
}
