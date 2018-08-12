const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const multer = require('multer');
const upload = multer();
const app = express();

/*
Referenced documentation here for MongoDB Node.JS Client (API Docs aren't very descriptive)
http://mongodb.github.io/node-mongodb-native/3.1/quick-start/quick-start/
*/

//set the templating engine to be Pug
app.set('views','views');
app.set('view engine', 'pug')


app.get("/", (req,res) => res.render('index.pug'))

//set MongoDB Connection URI
var mongoURI = `mongodb://${process.env.user}:${process.env.password}@ds131621.mlab.com:31621/nationalparks`;

app.post("/results", upload.array() ,(req,res) => {

  var data = {test1:1, test2:2, test3:3}
  //connect to MongoDB using Mongo URI
  MongoClient.connect(mongoURI,(err,client) => {
    database = client.db('nationalparks');
    collection = database.collection('species');
    collection.find().limit(10).toArray((error,result) => {
      console.log(result);
      res.render('results', {query:result});
    });
    client.close();
  });
})

app.listen(process.env.PORT);
console.log(process.env.PORT);
