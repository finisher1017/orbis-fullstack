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


app.get('/api/stocktwits/:symbol/get-twits', async (req, res) => {
    const { symbol } = req.body;
    const symbolName = req.params.symbol;
    const response = await axios.get(`https://api.stocktwits.com/api/2/streams/symbol/${symbolName}.json`);
    const twits = response.data.messages;
    
    // twits.forEach((twit) => {
    //     const twitData = {
    //         "id": twit.id,
    //         "stocktwits_timestamp": twit.created_at,
    //         "username": twit.user.username,
    //         "body": twit.body

    //     }
    //     console.log(`id: ${twitData.id}`);
    //     console.log(`stocktwits_timestamp: ${twitData.stocktwits_timestamp}`); 
    //     console.log(`username: ${twitData.username}`);
    //     console.log(`body: ${twitData.body}`);
    //     console.log('###########################################')
    // })
    // res.send(twitData);

    withDB(async (db) => {
        // const twits = await db.collection('twits').insertOne({ symbolName: twitData });
        
        var loopCount = 1;
        twits.forEach(async (twit) => {
            // var symbolFound = await db.collection('twits').findOne({ symbol: symbolName });
            console.log("loop count: " + loopCount);
            let twitData = {
                "id": twit.id,
                "stocktwits_timestamp": twit.created_at,
                "username": twit.user.username,
                "body": twit.body
            
            }
            console.log(twitData);
            await db.collection('twits').update(
                {"symbol": "AAPL"},
                { $push: { twits: twitData }}
            )
            // await db.collection('twits').updateOne({ symbol: symbolName },
            //     {
            //         '$set': {
            //             twits: symbolFound.twits.concat(twitData)
            //         }
            //     });
            loopCount = loopCount += 1;
        });
        
        // const updatedSymbolInfo = await db.collection('twits').findOne({ symbol: symbolName });
        // console.log(updatedSymbolInfo);
    }, res);

});

// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname + '/build/index.html'));
// });

app.listen(8000, () => console.log("Listening on port 8000"));