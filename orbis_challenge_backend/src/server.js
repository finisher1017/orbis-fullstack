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
                await db.collection('twits').insertOne({"symbol": symbolName, "twits": []});
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
                await db.collection('twits').updateOne(
                    {"symbol": symbolName},
                    { $push: { twits: { $each: twitsList } } }
                )
                const existingTwits = await db.collection('twits').find({});
                const allTwits = await existingTwits.toArray();
                res.status(200).json(allTwits);
            } else {
                const existingTwits = await db.collection('twits').find({});
                res.send({message: "Already exists"});
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
            const getCurrentTwits = await db.collection('twits').find({});
            const existingTwits = await getCurrentTwits.toArray();
            res.status(200).json(existingTwits);
        } catch (error) {
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

// var timerID = setInterval(async () => {
//     const symbol = "AAPL";

//     const newTwits = await axios.get(`https://api.stocktwits.com/api/2/streams/symbol/${symbol}.json`);
//     const newResponse = newTwits.data.messages;
//     const newTwitsIds = newResponse.map(twit => twit = twit.id);

//     try {
//         dbWithoutres(async (db) => {
//             const results = await db.collection('twits').findOne({"symbol": symbol});
//             const twitsList = results.twits.map(twit => twit = twit.id);
//             const twitsToAdd = [];
//             for (var i = 0; i <= newTwitsIds.length; i++) {
//                 console.log(`Checking ${newTwitsIds[i]}`);
//                 if (twitsList.includes(newTwitsIds[i])) {
//                     console.log(`${newTwitsIds[i]} is in the database`);
//                     break;
//                 } else {
//                     console.log(`Adding ${newTwitsIds[i]} to the database`);
//                     newResponse.forEach((t) => {
//                         if (t.id === newTwitsIds[i]) {
//                             twitsToAdd.push(api_methods.convertOneTwit(t));
//                         }
//                     });
//                 }
//                 console.log("##################################");
//             };
//             console.log(`${twitsList.length} found in database.`);
//             console.log(`${twitsToAdd.length} twits to add.`);
//             await db.collection('twits').updateOne(
//                 {"symbol": symbol},
//                 { $push: { twits: { $each: twitsToAdd } } }
//             )
//             const updatedTwits = await db.collection('twits').findOne({"symbol": symbol});
//             const updatedTwitsList = updatedTwits.twits.map(twit => twit = twit.id);
//             var sortedUpdatedTwitsList = updatedTwitsList.sort();
//             console.log(`${sortedUpdatedTwitsList.length} twits now in database`);
//             const newTwitsToAddList = [];
//             if (sortedUpdatedTwitsList.length > 40) {
//                 console.log((sortedUpdatedTwitsList.length - 40) + " to delete");
//                 const remainingTwits = sortedUpdatedTwitsList.slice(sortedUpdatedTwitsList.length - 40);
//                 console.log(updatedTwits.twits.length);
//                 updatedTwits.twits.forEach((t) => {
//                     if (remainingTwits.includes(t.id)) {
//                         newTwitsToAddList.push(t);
//                     }
//                 })
                
//                 console.log(newTwitsToAddList.length + " in new list");
//                 await db.collection('twits').updateOne(
//                     {"symbol": symbol},
//                     { $set: {"twits": []}}
//                 )
//                 await db.collection('twits').updateOne(
//                     {"symbol": symbol},
//                     { $push: { twits: { $each: newTwitsToAddList } } }
//                 )
//             }
            
            
            
//         });
//     } catch (error) {
//         console.log("Error from request")
//         console.log(error);
//     }
// }, 1000000);



// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname + '/build/index.html'));
// });


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));