const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const multer = require('multer');
const upload = multer();
const app = express();

/*
Referenced documentation here for MongoDB Node.JS Client (API Docs aren't very descriptive)
http://mongodb.github.io/node-mongodb-native/3.1/quick-start/quick-start/

API Docs: http://mongodb.github.io/node-mongodb-native/3.1/api/
*/

//set MongoDB Connection URI
var mongoURI = `mongodb://${process.env.user}:${process.env.password}@ds131621.mlab.com:31621/nationalparks`;

//set the templating engine to be Pug
app.set('views','views');
app.set('view engine', 'pug');

var resourceMiddleware = express.static('resources'); //construct function that serves static files from internal 'resources' folder
app.use("/resources",resourceMiddleware); //'mount' the  function to trigger at the external '/resources' path

app.get("/index", (req,res) => {
  MongoClient.connect(mongoURI, (err,client) => {
    var database = client.db("nationalparks");
    var collection = database.collection("species");

    var parkNames = collection.distinct("Park Name");
    var categories = collection.distinct("Category");

    Promise.all([parkNames , categories]).then(results => {
      res.render('index.pug', {parks:results[0], categories:results[1]});
    });
    client.close();
  })
})

app.post("/results", upload.array() ,(req,res) => {
  //connect to MongoDB using Mongo
  MongoClient.connect(mongoURI,(err,client) => {
    var database = client.db('nationalparks');
    var collection = database.collection('species');

    var queryCriteria = {
      "Park Name":req.body.park,
      "Category":req.body.category
    };

    //get query result count
    var count = collection.find(queryCriteria).count();

    //get query result
    var model = collection.find(queryCriteria)
        .skip(parseInt(req.body.index))
        .limit(10)
        .toArray()

    //work with query results
    Promise.all([model, count]).then((results) => {
      var lowerBound = parseInt(req.body.index)
      var recordCount = results[1];
      var upperBound = (lowerBound + 10 < recordCount) ? (lowerBound +  10) : recordCount;

      // modify "Common Names" field to contain only the shortest length name from original
      results[0].forEach((document) => {
        document["Common Names"] =
          document["Common Names"].split(", ")
            .sort((nameA,nameB) => nameA.length - nameB.length)[0]
      });

      res.render('results', {
        query:results[0],
        lowerBound:lowerBound,
        count:results[1],
        upperBound:upperBound,
        park:req.body.park,
        category:req.body.category});
    })
    client.close();
  });
})

app.listen(process.env.PORT);
