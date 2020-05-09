

const history = new Set();
let loaded = false;

export function load() {
    if (!loaded) {
        const historyString = window.sessionStorage.getItem('history');
        const historyArr = JSON.parse(historyString) || [];

        for (const item of historyArr) {
            history.add(item);
        }
        loaded = true;
    }

    return history;
}


function save() {
    try {
        const historyString = JSON.stringify([...history]);
        window.sessionStorage.setItem('history', historyString);
    } catch (err) {}
}

export function add(item) {
    history.add(item);
    save();
}