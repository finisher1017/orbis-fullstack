import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom';
import TwitsList from '../components/TwitsList';
import SearchForm from '../components/SearchForm';
import Dropdown from '../components/Dropdown';
import SearchSymbols from '../components/SearchSymbols';
// const latestTwits = fetch(`/api/stocktwits/AAPL/get-twits`);

const MainPage = () => {

    return (
        <>
            <SearchForm />
            <TwitsList />
        </>
    )

}

export default MainPage;