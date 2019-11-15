import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import path from 'path';
const axios = require('axios');


const app = express();

app.use(express.static(path.join(__dirname, '/build')));
app.use(bodyParser.json());

const withDB = async (operations, res) => {
    try {
        const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db('orbis-fullstack');

        await operations(db);

        client.close();
    } catch (error) {
        res.status(500).json({ message: 'Error connecting to db', error });
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
app.post('/api/stocktwits/:symbol/get-twits', async (req, res) => {
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
                const newTwits = await db.collection('twits').findOne({"symbol": symbolName});
                res.send(newTwits);
            } else {
                const existingTwits = await db.collection('twits').findOne({"symbol": symbolName});
                res.send(`$${symbolName} list of twits already exists with ${existingTwits.twits.length} twits.`);
            }
        }, res);
    } catch (error) {
        res.send(error.message);
    }
});


// delete existing twits
app.post('/api/stocktwits/:symbol/delete', (req, res) => {
    const symbolName = req.params.symbol;

    try {
        withDB(async (db) => {
            const checkTwits = await db.collection('twits').findOne({"symbol": symbolName});
            if (checkTwits !== null) {
                await db.collection('twits').remove({"symbol": symbolName});
                res.send(`${symbolName} twits deleted.`);
            } else {
                res.send("No twits found.");
            }
        }, res);
    } catch (error) {
        console.log("Something went wrong.");
    }

});

// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname + '/build/index.html'));
// });

app.listen(8000, () => console.log("Listening on port 8000"));