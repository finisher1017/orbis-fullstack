import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Example = () => {
    const [data, setData] = useState({ symbols: [] });
    const [query, setQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const result = await axios.get('/api/stocktwits/get-saved-twits');
            // console.log(result.data);
            setData({ symbols: result.data });
        }
        fetchData();
    }, []);
    return (
        <ul>
            {data.symbols.map((symbol, key) => (
                <li key={symbol._id}>
                    <h1>{symbol.symbol}</h1>
                        <ul>
                            {symbol.twits.map((twit) => (
                                <li key={twit.id}>
                                    <p>{twit.username} on {twit.stocktwits_timestamp}</p>
                                    <p>{twit.body}</p>
                                </li>
                            ))}
                        </ul>
                </li>
            ))}
        </ul>
    )
}


// const Example = () => {
//     const [data, setData] = useState({ hits: [] });
//     const [query, setQuery] = useState('redux');
//     const [url, setUrl] = useState(`https://hn.algolia.com/api/v1/search?query=redux`);

//     useEffect(() => {
//         async function fetchData() {
//             const result = await axios(url);
//             setData(result.data);
//         }
//         fetchData();
//     }, [url]);
//     return (
//         <>
//             <input type="text" value={query} onChange={event => setQuery(event.target.value)} />
//             <button type="button" onClick={() => setUrl(`https://hn.algolia.com/api/v1/search?query=${query}`)}>Search</button>
//             <ul>
//                 {data.hits.map(item => (
//                     <li key={item.objectID}>
//                         <a href={item.url}>{item.title}</a>
//                     </li>
//                 ))}
//             </ul>
//         </>
//     )
// }

// const Example = () => {
//     const [music, setMusic] = useState({albums: []});
//     useEffect(() => {
//         async function fetchData() {
//             const results = await fetch('https://rallycoding.herokuapp.com/api/music_albums');
//             const json = await results.json();
//             setMusic({albums: json });
//         }
//         fetchData();
//     }, []);
//     return (
        
//             <ul>
//              {music.albums.map((album, k) =>
//                 <li key={k}>
//                     <p>{album.title}</p>
//                 </li>
//               )}
//         </ul>
        
//     )
// }


// const API = 'https://hn.algolia.com/api/v1/search?query=';
// const DEFAULT_QUERY = 'redux';

// class Example extends Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//       hits: [],
//       isLoading: false,
//       error: null
//     };
//   }

//   componentDidMount() {
//       this.setState({ isLoading: true });

//       axios.get(API + DEFAULT_QUERY)
//         .then(result => this.setState({
//             hits: result.data.hits,
//             isLoading: false
//         }))
//         .catch(error => this.setState({error, isLoading: false }));
//   }
  
//   render() {
//     const { hits, isLoading, error } = this.state;

//     if (error) {
//         return <p>{error.message}</p>;
//     }

//     if (isLoading) {
//         return <p>Loading...</p>;
//     }

//     return (
//         <ul>
//             {hits.map(hit =>
//                 <li key={hit.objectID}>
//                     <a href={hit.url}>{hit.title}</a>
//                 </li>
//             )}
//         </ul>
//       )
//   }
  
// }



export default Example;