import { SEARCH_SYMBOLS, ADD_SYMBOLS , DELETE_SYMBOL } from './types';

export const getTwits = () => dispatch => {
    fetch('/api/stocktwits/get-saved-twits')
    .then(res => res.json())
    .then(symbols => dispatch({
        type: SEARCH_SYMBOLS,
        payload: symbols
    }));
};

export const addSymbols = symbols => dispatch => {
    console.log("addsymbols action");
    fetch(`/api/stocktwits/${symbols}/new-twits`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(symbols => dispatch({
            type: ADD_SYMBOLS,
            payload: symbols
        }))
};


export const deleteSymbol = symbol => dispatch => {
    console.log("Delete symbol action");
    fetch(`/api/stocktwits/${symbol}/delete`, {
        method: 'POST'
    })
    .then(res => res.json())
    .then(symbols => dispatch({
        type: DELETE_SYMBOL,
        payload: symbols
    }));
};

