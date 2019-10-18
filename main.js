var http = require('http');
var fs = require('fs');
var express = require('express')
var mongo = require('mongodb');
var client = mongo.MongoClient;
url = "mongodb://localhost:27017/";
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });
var path = require('path');

var app = express();
app.set('view engine', 'hbs');
client.connect(url,function(err,db){
    if(err) throw err;
    dbo = db.db('mydb');
    dbo.createCollection("customers", function(err, res) {
        if (err) throw err;
        console.log("Collection created!");
    });
    dbo.createCollection("cars", function(err, res) {
        if (err) throw err;
        console.log("Collection created!");
    });
    console.log("Database created!");
});
app.get('/home',function(req,res){
    res.sendFile(path.join(__dirname,'home.html'));
});

app.get('/add_car',function(req,res){
    res.sendFile(path.join(__dirname,'add_car.html'));
});

app.get('/booking',function(req,res){
    res.sendFile(path.join(__dirname,'booking.html'));
});

app.get('/car_data',function(req,res){
    var resultArray = [];
    client.connect(url, function(err,db){
        var dbo = db.db("mydb");
        console.log('working-1');
        var cursor = dbo.collection('cars').find({available : 'Yes'});
        cursor.forEach(function(doc,err){
            console.log('working -2');
            resultArray.push(doc);
        }, function(){
            db.close();
            res.render('booking', {items : resultArray});
        });
    });
    
});

app.post('/car_added', urlencodedParser,function(req,res){
    var val={'vehicle_num': req.body.vehicle_num, 
        'model' : req.body.model,
        'capacity' : req.body.capacity,
        'rent' : req.body.rent,
        'available' : req.body.available
    };
    client.connect(url,function(err,db){
        var dbo = db.db("mydb");
        dbo.collection('cars').insertOne(val,function(err,res){
            if (err) throw err;
            console.log("1 document inserted");
        });
    });
    res.writeHead(200,{'Content-Type':'text/html'});
    res.write('Thanks for submitting your info!');
    res.end();
});

app.post('/booked', urlencodedParser,function(req,res){
    val={'cust_name': req.body.cust_name, 
        'mobile' : req.body.mobile,
        'issue' : req.body.issue,
        'return' : req.body.return,
        'booking_date' : Date(),
        'vehicle_num' : req.body.car
    };
    console.log(val);
    client.connect(url,function(err,db){
        var dbo = db.db("mydb");
        dbo.collection('customers').insertOne(val,function(err,res){
            if (err) throw err;
            console.log("1 document inserted");
            var myquery ={vehicle_num: req.body.car};
            var newvals= {$set : {available:'No'}};
            dbo.collection('cars').updateOne(myquery,newvals,function(){
                if (err) throw err;
                console.log("1 document updated");
                db.close();
            });
            
        });
    });
    
    res.writeHead(200,{'Content-Type':'text/html'});
    res.write('Thanks for submitting your info!');
    res.end();
});

app.post('/thanks', urlencodedParser,function(req,res){
    val={'username': req.body.username, 'pass' : req.body.pass};
    res.writeHead(200,{'Content-Type':'text/html'});
    res.write('Thanks for submitting your info!');
    res.end();
});

app.listen(8080,function(){
    console.log("Connected to express!!!");
});
