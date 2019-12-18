import { SEARCH_SYMBOLS, ADD_SYMBOLS, DELETE_SYMBOL } from '../actions/types';

const initialState = {
    symbols: [],
    symbol: {}
}

export default (state = initialState, action) => {
    switch(action.type) {
        case SEARCH_SYMBOLS:
            return {
                ...state,
                symbols: action.payload
            }
        case ADD_SYMBOLS:
            return {
                ...state,
                symbols: action.payload
            }
        case DELETE_SYMBOL:
            return {
                ...state,
                symbols: action.payload
            }
        default:
            return state;
    }
}