export function timeDigitsToString(digits) {
    // Проверяем валидность входных данных
    if (typeof digits !== 'string' || !digits) {
        return 0;
    }

    // Разделяем строку по двоеточию
    const parts = digits.split(':');

    // Проверяем корректность формата
    if (parts.length < 2) {
        return 0;
    }

    // Преобразуем части в числа
    const minutes = parseInt(parts[0]) || 0;
    const seconds = parseInt(parts[1]) || 0;

    // Вычисляем общее количество секунд
    if (!minutes && !seconds) return "Нажмите, чтобы указать интервал"
    let result = ""
    if (minutes) {
        result += `${minutes} минут `;
    }
    if (seconds) {
        result += `${seconds} секунд`;
    }

    return result;
}

export function formatRussianDateTime(datetimeString) {
    const date = datetimeString instanceof Date
        ? datetimeString
        : new Date(datetimeString);

    if (isNaN(date.getTime())) {
        return 'Неверная дата';
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const dateYear = date.getFullYear();

    const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];

    const pad = (num) => num.toString().padStart(2, '0');

    const day = date.getDate();
    const month = months[date.getMonth()];
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    let result = `${day} ${month}`;

    if (dateYear !== currentYear) {
        result += ` ${dateYear}`;
    }

    result += `, ${hours}:${minutes}`;

    return result;
}

export const getLocalDateTime = (offset) => new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000 + 1000*offset).toISOString().slice(0, 16);