import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import path from 'path';
import { builtinModules } from 'module';
const api_methods = require('./api-methods');
const config = require('./config');
const axios = require('axios');


const app = express();

app.use(express.static(path.join(__dirname, '/build')));
app.use(bodyParser.json());

const withDB = async (operations, res) => {
    try {
        const client = await MongoClient.connect(config.dbConnect, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db('orbis-fullstack');

        await operations(db);

        client.close();
    } catch (error) {
        res.status(500).json({ message: 'Error connecting to db', error });
    }
}

const dbWithoutres = async (operations) => {
    try {
        // const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true });
        const client = await MongoClient.connect(config.dbConnect, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db('orbis-fullstack');

        await operations(db);

        client.close();
    } catch (error) {
        console.log(error);
    }
}

const getNewTwits = async (symbol) => {
    try {
        const newTwits = await axios.get(`https://api.stocktwits.com/api/2/streams/symbol/${symbol}.json`);
        const results = newTwits.data.messages;
        return results;
    } catch (error) {
        return error;
    }
}

app.get('/api/articles/:name', async (req, res) => {
    withDB(async (db) => {
        const articleName = req.params.name;

        const articleInfo = await db.collection('articles').findOne({ name: articleName });
        res.status(200).json(articleInfo);
    }, res);
});

app.post('/api/articles/:name/upvote', async (req, res) => {
    withDB(async (db) => {
        const articleName = req.params.name;

        const articleInfo = await db.collection('articles').findOne({ name: articleName });
        await db.collection('articles').updateOne({ name: articleName },
        {
            '$set': { upvotes: articleInfo.upvotes + 1 }
        });
        const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });

        res.status(200).json(updatedArticleInfo);
    }, res);
});

app.post('/api/articles/:name/add-comment', (req, res) => {
    const { username, text } = req.body;
    const articleName = req.params.name;

    withDB(async (db) => {
        const articleInfo = await db.collection('articles').findOne({ name: articleName });
        await db.collection('articles').updateOne({ name: articleName },
        {
            '$set': {
                comments: articleInfo.comments.concat({ username, text })
            }
        });
        const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });

        res.status(200).json(updatedArticleInfo);
    }, res);
});

// add new twits matching symbol if none exist
app.post('/api/stocktwits/:symbol/new-twits', async (req, res) => {
    const { symbol } = req.body;
    const symbolName = req.params.symbol;
    try {
        const response = await axios.get(`https://api.stocktwits.com/api/2/streams/symbol/${symbolName}.json`);
        const twits = response.data.messages;
        withDB(async (db) => {
            const checkTwits = await db.collection('twits').findOne({"symbol": symbolName});
            if (checkTwits === null) {
                await db.collection('twits').insertOne({"symbol": symbolName, "timestamp": new Date().getTime(), "twits": []});
                let twitsList = [];
                twits.forEach(async (twit) => {
                    const twitData = {
                        "id": twit.id,
                        "stocktwits_timestamp": twit.created_at,
                        "username": twit.user.username,
                        "body": twit.body

                    }
                    twitsList.push(twitData);
                })
                twitsList = twitsList.sort();
                await db.collection('twits').updateOne(
                    {"symbol": symbolName},
                    { $push: { twits: { $each: twitsList } } }
                )
                const existingTwits = await db.collection('twits').find({}).sort({timestamp: -1});
                const allTwits = await existingTwits.toArray();
                res.status(200).json(allTwits);
            } else {
                console.log("this far");
                const existingTwits = await db.collection('twits').find({}).sort({timestamp: -1});
                const allTwits = await existingTwits.toArray();
                res.send(allTwits);
            }
        }, res);
    } catch (error) {
        res.send(error.message);
    }
});


// retrieve existing twits from database
app.get('/api/stocktwits/get-saved-twits', (req, res) => {
    const symbol = req.params.symbol;
    withDB(async (db) => {
        try {
            const getCurrentTwits = await db.collection('twits').find({}).sort({timestamp: -1});
            const existingTwits = await getCurrentTwits.toArray();
            res.status(200).json(existingTwits);
        } catch (error) {
            res.send(error);
        }
    }, res);
});

// return list of symbols in the database
app.get('/api/stocktwits/list-symbols', (req, res) => {
    // const symbol = req.params.symbol;
    const symbolList = [];
    console.log("kicked off")
    withDB(async (db) => {
        try {
            const getCurrentTwits = await db.collection('twits').find({}).sort({timestamp: -1});
            const existingTwits = await getCurrentTwits.toArray();
            existingTwits.forEach(s => symbolList.push(s.symbol));
            res.status(200).json(symbolList);
        } catch (error) {
            console.log("something went wrong");
            res.send(error);
        }
    }, res);
});


// delete existing twits
app.post('/api/stocktwits/:symbol/delete', (req, res) => {
    const symbolName = req.params.symbol;

    try {
        withDB(async (db) => {
            const checkTwits = await db.collection('twits').findOne({"symbol": symbolName});
            if (checkTwits !== null) {
                await db.collection('twits').remove({"symbol": symbolName});
                const getCurrentTwits = await db.collection('twits').find({});
                const existingTwits = await getCurrentTwits.toArray();
                res.status(200).json(existingTwits);
                // res.send(`${symbolName} twits deleted.`);
            } else {
                res.send("No twits found.");
            }
        }, res);
    } catch (error) {
        console.log("Something went wrong.");
    }
});


// app.post('/api/test-updates', async (req, res) => {
var timerID = setInterval(async () => {
    try {
        dbWithoutres(async (db) => {
            let symbols = await db.collection('twits').find({});
            symbols = await symbols.toArray();
            symbols = symbols.map(symbol => symbol.symbol);
            for (let i = 0; i <= symbols.length - 1; i++) {
                let symbol = symbols[i];
                const newResults = await axios.get(`https://api.stocktwits.com/api/2/streams/symbol/${symbol}.json`);
                const newTwits = newResults.data.messages;
                const currentResults = await db.collection('twits').findOne({"symbol": symbol});
                const currentTwits = currentResults.twits;
                const newTwitsIdsList = newTwits.map(twit => twit.id);
                const currentTwitsIdsList = currentTwits.map(twit => twit.id);
                let twitsToAdd = [];
                for (var t = 0; t <= newTwitsIdsList.length - 1; t++) {
                        if (currentTwitsIdsList.includes(newTwitsIdsList[t])) {
                            console.log(`${t}. ${newTwitsIdsList[t]} Included`);
                            break;
                        } else {
                            console.log(`${t}. ${newTwitsIdsList[t]} not included`);
                            twitsToAdd.push(api_methods.convertOneTwit(newTwits[t]));
                        }
                }
                console.log(`#####${twitsToAdd.length} ${symbol} Twits to add#####`)
                await db.collection('twits').updateOne(
                    {"symbol": symbol},
                    { $push: { twits: { $each: twitsToAdd } } }
                )
                
            }
            console.log("Updates completed?");




            // const newResults = await axios.get(`https://api.stocktwits.com/api/2/streams/symbol/${symbol}.json`);
            // const currentResults = await db.collection('twits').findOne({"symbol": symbol});
            // const newTwits = newResults.data.messages;
            // const currentTwits = currentResults.twits;
            // const newTwitsIdsList = newTwits.map(twit => twit.id);
            // const currentTwitsIdsList = currentTwits.map(twit => twit.id);
            // let twitsToAdd = [];
            // console.log("###New Twits Ids###");
            // console.log(newTwitsIdsList);
            // console.log("###Current Twits Ids###");
            // console.log(currentTwitsIdsList);
            // for (var i = 0; i <= newTwitsIdsList.length - 1; i++) {
            //     if (currentTwitsIdsList.includes(newTwitsIdsList[i])) {
            //         console.log(`${i}. ${newTwitsIdsList[i]} Included`);
            //         break;
            //     } else {
            //         console.log(`${i}. ${newTwitsIdsList[i]} not included`);
            //         twitsToAdd.push(api_methods.convertOneTwit(newTwits[i]));
            //     }
            // }
            // await db.collection('twits').updateOne(
            //     {"symbol": symbol},
            //     { $push: { twits: { $each: twitsToAdd } } }
            // )

            // let updatedTwits = await db.collection('twits').findOne({"symbol": symbol});
            // res.status(200).json(updatedTwits.twits);
        });
    } catch (error) {
        console.log(error);
    }
}, 300000); 
// })

// var timerID = setInterval(async () => {

    

//     try {
//         dbWithoutres(async (db) => {
//             const symbolList = [];
//             const getCurrentTwits = await db.collection('twits').find({});
//             const existingTwits = await getCurrentTwits.toArray();
//             existingTwits.forEach(s => symbolList.push(s.symbol));
//             symbolList.forEach(async (symbol) => {
//                 const newTwits = await axios.get(`https://api.stocktwits.com/api/2/streams/symbol/${symbol}.json`);
//                 const newResponse = newTwits.data.messages;
                
//                 const newTwitsIds = newResponse.map(twit => twit = twit.id);
//                 const results = await db.collection('twits').findOne({"symbol": symbol});
//                 console.log(results.cursor)
//                 const twitsList = results.cursor.toArray.twits.map(twit => twit = twit.id);
//                 console.log(twitsList)
//                 const twitsToAdd = [];
//                 for (var i = 0; i <= newTwitsIds.length; i++) {
//                     console.log(`Checking ${newTwitsIds[i]}`);
//                     if (twitsList.includes(newTwitsIds[i])) {
//                         console.log(`${newTwitsIds[i]} is in the database`);
//                         break;
//                     } else {
//                         console.log(`Adding ${newTwitsIds[i]} to the database`);
//                         newResponse.forEach((t) => {
//                             if (t.id === newTwitsIds[i]) {
//                                 twitsToAdd.push(api_methods.convertOneTwit(t));
//                             }
//                         });
//                     }
//                     console.log("##################################");
//                 };
//                 console.log(`${twitsList.length} found in database.`);
//                 console.log(`${twitsToAdd.length} twits to add.`);
//                 await db.collection('twits').updateOne(
//                     {"symbol": symbol},
//                     { $push: { twits: { $each: twitsToAdd } } }
//                 )
//                 const updatedTwits = await db.collection('twits').findOne({"symbol": symbol});
//                 const updatedTwitsList = updatedTwits.twits.map(twit => twit = twit.id);
//                 var sortedUpdatedTwitsList = updatedTwitsList.sort();
//                 console.log(`${sortedUpdatedTwitsList.length} twits now in database`);
//                 const newTwitsToAddList = [];
//                 if (sortedUpdatedTwitsList.length > 40) {
//                     console.log((sortedUpdatedTwitsList.length - 40) + " to delete");
//                     const remainingTwits = sortedUpdatedTwitsList.slice(sortedUpdatedTwitsList.length - 40);
//                     console.log(updatedTwits.twits.length);
//                     updatedTwits.twits.forEach((t) => {
//                         if (remainingTwits.includes(t.id)) {
//                             newTwitsToAddList.push(t);
//                         }
//                     })
                    
//                     console.log(newTwitsToAddList.length + " in new list");
//                     await db.collection('twits').updateOne(
//                         {"symbol": symbol},
//                         { $set: {"twits": []}}
//                     )
//                     await db.collection('twits').updateOne(
//                         {"symbol": symbol},
//                         { $push: { twits: { $each: newTwitsToAddList } } }
//                     )
//                 }
//             })
            
            
            
            
//         });
//     } catch (error) {
//         console.log("Error from request")
//         console.log(error);
//     }
// }, 30000);



// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname + '/build/index.html'));
// });


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));