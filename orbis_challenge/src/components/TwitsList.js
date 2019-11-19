import React from 'react';
// import { Link } from 'react-router-dom';

const TwitsList = ({ twits }) => {
    // console.log("Hello from twits list component");
    // const symbol = "AAPL";
    // const twits = fetch(`/api/stocktwits/${symbol}/get-twits`);
    // const twitsList = twits.twits;
    return (
        <>
        {twits.map((twit, key) => (
            <div className="article-list-item" key={key}>
                <h3>{twit.id}</h3>
                <h3>{twit.username}</h3>
                <h3>{twit.body}</h3>
                <h3>{twit.stocktwits_timestamp}</h3>
            </div>
        ))}
        </>
    )
    
};

export default TwitsList;