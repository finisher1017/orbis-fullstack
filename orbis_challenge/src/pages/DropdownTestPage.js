import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom';
import TwitsList from '../components/TwitsList';
import SearchForm from '../components/SearchForm';
import Dropdown from '../components/Dropdown';
import SearchSymbols from '../components/SearchSymbols';
import TestDropdownTwits from '../components/TestDropdownTwits';
// const latestTwits = fetch(`/api/stocktwits/AAPL/get-twits`);

const DropdownTestPage = () => {

    return (
        <>
            <SearchForm />
            <TestDropdownTwits />
        </>
    )

}

export default DropdownTestPage;