import {useEffect, useState} from "react";
import './SelectSessionsPage.css';




function OptionsBar({
    data,
    isCheckedList, setIsCheckedList,
    isMultiSelect, setIsMultiSelect,
    selected, setSelected
}) {

    return <div className="options-bar">
        <div
            className="clear-button"
            onClick={() => {
                setIsCheckedList(() => new Array(data.accounts.at(-1) + 1).fill(0));
            }}
        >
            🗑
        </div>
        <div
            className={`multi-select-button ${isMultiSelect? "active":""}`}
            onClick={() => setIsMultiSelect(!isMultiSelect)}
        >
            📝
        </div>
        <div className="submit-button" onClick={()=>{
            alert(data.accounts
                .filter(account => isCheckedList[account[0]])
                .map(account => account[0]));
        }}>⬆️</div>
    </div>
}

export default function SelectSessionsPage({ data }) {
    const [isCheckedList, setIsCheckedList] = useState(null);
    const [isMultiSelect, setIsMultiSelect] = useState(false);
    const [selected, setSelected] = useState([null, null]);
    useEffect(() => {
        setIsCheckedList(() => new Array(data.accounts.at(-1) + 1).fill(0));
    }, [data])

    function handleSelect(account, e) {
        if (isMultiSelect) {
            // ничего не выбрано, ставим первый
            if (selected[0] === null) {
                setSelected([account[0], null]);
                return
            }
            // выбран только первый, ставим второй
            if (selected[0] !== null && selected[1] === null) {
                if (account[0] > selected[0]){
                    setIsCheckedList(prev=>{
                        const newList = [...prev];
                        for (let i = selected[0]; i <= account[0]; i++) {
                            newList[i] = prev[selected[0]] ? 0 : 1;
                        }
                        return newList;
                    })
                }
                else {
                    setIsCheckedList(prev=>{
                        const newList = [...prev];
                        for (let i = account[0]; i <= selected[0]; i++) {
                            newList[i] = prev[selected[0]] ? 0 : 1;
                        }
                        return newList;
                    })
                }
                setSelected([null, null])
                setIsMultiSelect(false);
                return
            }
            // выбраны оба, сбрасываем и ставим первый
            if (selected[0] !== null && selected[1] === null) {
                setSelected([account[0], null]);
                return
            }

        }
        setIsCheckedList((prev) => {
            const newList = [...prev];
            newList[account[0]] = e.target.checked ? 1 : 0;
            return newList;
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const accounts = data.accounts
            .filter(account => isCheckedList[account[0]])
            .map(account => account[0])
        const result = {page: "SelectSessionsPage", ids_list: accounts}
        const payload = JSON.stringify(result);
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.sendData(payload);
            window.Telegram.WebApp.close();
        } else {
            console.log("Payload:", payload);
        }
    };
    return (<>
        <div className="container">
            <h2 className="title">Выбор аккаунтов</h2>
            <ul className="accountsList">
                {data.accounts.map(account => (
                    <li
                        key={account[0]}
                        className={`accountItem${selected.includes(account[0]) ? " highlight" : ""}`}
                    >
                        <span className="accountName">{account[1]}</span>
                        <input
                            className="accountCheckbox"
                            type="checkbox"
                            checked={isCheckedList && isCheckedList[account[0]] === 1}
                            onChange={(e) => handleSelect(account, e)}
                        />
                    </li>
                ))}
            </ul>
        </div>
        <OptionsBar
            data={data}
            isCheckedList={isCheckedList}
            setIsCheckedList={setIsCheckedList}
            isMultiSelect={isMultiSelect}
            setIsMultiSelect={setIsMultiSelect}
            handleSubmit={handleSubmit}
        />
    </>)
}