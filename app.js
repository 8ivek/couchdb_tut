const express = require ('express');
const bodyParser = require ('body-parser');
const path = require ('path'); // core module we don't have to install it.
const nodeCouchDb = require ('node-couchdb');

const dbName = "shopping_site";
const viewUrl = "_design/view2/_view/id";

const couch = new nodeCouchDb({
    auth:{
        user: 'admin',
        pass: 'admin'
    }
});

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/',function(req,res){

    couch.get(dbName,viewUrl).then(
        ({data,headers,status})=>{
            res.render('index',{
                customers:data.rows
            });
            //console.log(data.rows);
            //console.log(headers);
        },err =>{
            console.log(err)
        }
    );

    //res.render('index');
});

//Edit
app.get('/customer/edit/:id',function(req,res){

    let id = req.params.id;

    couch.get(dbName,id).then(
        ({data,headers,status})=>{
            res.render('edit',{
                customer:data
            });
        },err =>{
            console.log(err)
        }
    );

    //res.render('index');
});

//Update or Save
app.post('/customer/save/:id',function(req,res){
    let id = req.params.id;
    let rev = req.body.rev;
    let name = req.body.name;
    let email = req.body.email;
    let phone = req.body.phone;

    couch.update(dbName,{
        _id : id,
        _rev: rev,
        name: name,
        email: email,
        phone: phone
    }).then(
        function(data,headers,status){
            res.redirect('/');
        },
        function(err){
            res.send(err);
        });
});

app.post('/customer/add',function(req,res){
    let name = req.body.name;
    let email = req.body.email;
    let phone = req.body.phone;
    couch.uniqid(1).then(function(id){
        couch.insert(dbName,{
            _id : id[0],
            name: name,
            email: email,
            phone: phone
        }).then(
            function(data,headers,status){
                res.redirect('/');
            },
            function(err){
                res.send(err);
            });
    });
});

app.post('/customer/delete/:id',function(req,res){
    let id = req.params.id;
    let rev = req.body.rev;
    couch.del(dbName,id,rev).then(
        function(data,headers,status){
            res.redirect('/');
        },
        function(err){
            res.send(err);
        }
    );
});

app.listen(3000,function(){
    console.log('Server started on port 3000');
});