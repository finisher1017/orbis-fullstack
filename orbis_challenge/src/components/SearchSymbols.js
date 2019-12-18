import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SearchSymbols = () => {
    const [searchResult, setSearchResult] = useState({ symbolData: {} });
    const [query, setQuery] = useState({value: ''});

    // useEffect(() => {
    //     const fetchData = async () => {
    //         console.log(query.value);
    //         const result = await axios.post(`/api/stocktwits/${query.value}/new-twits`);
    //         setSearchResult({ symbolData: result.data });
    //     }
    //     fetchData();
    // }, [query]);

    const handleChange = async (event) => {
        // console.log(query.value);
    }

    const handleSubmit = async (event) => {
        const result = await axios.post('/api/stocktwits/AAPL/new-twits');
        if (result.data === "already exists") {
            console.log("Twits already exist for this symbol");
        }
        // setSearchResult(json);
        // console.log(searchResult.symbolData);
    }

    return (
        // <form onSubmit={handleSubmit}>
        //     <label>
        //         Search:
        //         <input type="text" value={query.value} onChange={handleChange} />
        //     </label>
        //     <input type="submit" value="Search" />
        // </form>
        <button onClick={handleSubmit}>Search</button>
    )
}

export default SearchSymbols;