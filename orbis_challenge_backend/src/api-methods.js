module.exports = {

    convertTwits: function(twits) {
        return twits.map((twit) => 
            twit = {
                "id": twit.id,
                "stocktwits_timestamp": twit.created_at,
                "username": twit.user.username,
                "body": twit.body
            }
        );
    },


    convertOneTwit: function(twit) {
        return {
                "id": twit.id,
                "stocktwits_timestamp": twit.created_at,
                "username": twit.user.username,
                "body": twit.body
            }
    }



}





// const newTwits = gettwits("AAPL");
// console.log(newTwits);