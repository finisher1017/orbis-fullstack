import React, { useState, useEffect } from 'react'
import TwitsList from '../components/TwitsList';
// const latestTwits = fetch(`/api/stocktwits/AAPL/get-twits`);

const MainPage = ({ match }) => {
    const symbol = match.params.symbol;
    const [existingTwits, setTwitInfo] = useState({ twits: [] });

    useEffect(() => {
        const fetchData = async () => {
            const result = await fetch(`/api/stocktwits/${symbol}/get-twits`);
            const body = await result.json();
            console.log(body);
            setTwitInfo(body);
        }
        fetchData();
        // setArticleInfo({ upvotes: Math.ceil(Math.random() * 10) });
    }, [symbol]);
    // const twitsList = latestTwits;
    // console.log(latestTwits);
    return (
    <>
        <h1>Twits</h1>
        <TwitsList twits={existingTwits.twits}/>
    </>
    )
    };

export default MainPage;