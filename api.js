var express = require('express'),bodyParser = require('body-parser')
var db_create = require('./mongo_setup');
var mongoose = require('mongoose');
const cors = require('cors');
mongoose.connect('mongodb://localhost:27017/blog');
var corsOptions = {
  origin: 'http://localhost:4200',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}


var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}) );
app.use(cors(corsOptions));

// user Schema
var personSchema = mongoose.Schema({
   name: String,
   email: String,
   password: String
});
var Person = mongoose.model("Person", personSchema);


// first demo blog post for all users
var bpostSchema = mongoose.Schema({
   title: String,
   discription: String,
   likes: { type: Number, min: 0 } ,
   dlikes: { type: Number, min: 0 } ,
   views: { type: Number, min: 0 }
});
var Bpost = mongoose.model("Bgpost", bpostSchema);

Bpost.findOneAndUpdate({title: "this is my demo app"}, {
   title: "this is my demo app",
   discription: "Hey guys this is my demo post, here you can like ,dilike and view the my blog ",
   likes: 0,
   dlikes: 0,
   views: 0
}, { upsert: true  }, function(err, response) {
    console.log(response);
});

//get user
app.get('/users', function(req, res){
   Person.find(function(err, response){
      res.json(response);
   });
});

// create new user api
app.post('/users', function(req, res){
   var personInfo = req.body; //Get the parsed information
   console.log(req.body)
   if(!personInfo.name || !personInfo.email || !personInfo.password){
      res.render('show_message', {
         message: "Sorry, you provided worng info", type: "error"});
   } else {
      var newPerson = new Person({
         name: personInfo.name,
         email: personInfo.password,
         password: personInfo.email
      });

      newPerson.save(function(err, Person){
         if(err)
             res.status(500).send("There was a problem adding the information to the database.");
         else
             res.status(200).send(newPerson);

      });
   }
});

app.post('/login', function(req, res){
   var personInfo = req.body; //Get the parsed information
   console.log(req.body)
   if(!personInfo.email || !personInfo.password){
      res.status(400).send("please fill require fields");
   } else {
     Person.find({email: personInfo.email, password: personInfo.password},
      function(err, response){
         console.log(response);
         if(err)
             res.status(500).send("invalid username or password.");
         else{
           Bpost.findOneAndUpdate({title: "this is my demo app"}, { $inc: { views: +1 } }, function(err, response) {
               console.log(response);
           });
           Bpost.find(function(err, response){
              if(err)
                res.status(500).send("error getting blog post after login");
              else
                res.json({"code":200,"data":response});
           });
         }
    });
   }
});

app.post('/likes', function(req, res){
   var lInfo = req.body; //Get the parsed information

     if(lInfo.like > 0){
       console.log("like",lInfo.like)
       Bpost.findOneAndUpdate({title: "this is my demo app"}, { $inc: { likes: +1 } },{ new: true}, function(err, response) {
         console.log(response)
         res.json({"code":200,"data":[response]});
       });
     }
     else
     {
       if (lInfo.dlike > 0) {
       console.log("dlike",lInfo.like)
       Bpost.findOneAndUpdate({title: "this is my demo app"}, { $inc: { dlikes: +1,likes: -1 } },{ new: true}, function(err, response) {
           res.json({"code":200,"data":[response]});
       });
     }
   }
});

app.get('/likes', function(req, res){
  Bpost.find({title: "this is my demo app"}, function(err, response){
    res.json({"code":200,"data":response});
  });
});

app.get('/blogpost', function(req, res){
  Bpost.find({title: "this is my demo app"}, function(err, response){
    res.json({"code":200,"data":response});
  });
});

app.listen(3000, function() {
  console.log('Express server listening on port ' + 3000);
});
