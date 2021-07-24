const express = require('express')
const bodyParser = require('body-parser')
//const day = require(__dirname+"/today.js")
const app = express()
const _ = require("lodash")
const mongoose = require('mongoose')
console.log(__dirname+"/today.js")
app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended:true}))
app.set('view engine', 'ejs');
//let items = []
// let workItems = []

mongoose.connect("mongodb+srv://test123:test123@cluster0.vn1ak.mongodb.net/todolistDB?retryWrites=true&w=majority",{useNewUrlParser:true,useUnifiedTopology: true})

const itemSchema = mongoose.Schema({
    name:String
})

const Item = mongoose.model('Item',itemSchema)

const buyFood = new Item({
    name:"Welcome to To Do List"
})
const cookFood = new Item({
    name:"+ to add"
})
const poopFood = new Item({
    name:"Check box to delete"
})

const defaultItems =[buyFood,cookFood,poopFood]
const listSchema = {
    name:String,
    items:[itemSchema]
}
const List = mongoose.model("List",listSchema)


app.get('/',function(req,res){

    
    Item.find({},function(err,mongoRes){
        if(mongoRes.length === 0) {
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err)
                } else {
                    console.log("no errors , isnerted successfuly.")
                }
            })
            res.redirect('/')
        } else {
            res.render('list', {listTitle:"Today", itemArray:mongoRes});
        }
    })
     
})

// app.get('/work',function(req,res){
    
//     res.render("list",{listTitle:"Work",itemArray:workItems})
// })
app.get('/:customList',function(req,res){
    const customListName = _.capitalize(req.params.customList)
    
    List.findOne({name:customListName},function(err,listFound){
        if(!err){
            if(!listFound){
                const listDocument = new List({
                    name:customListName,
                    items:defaultItems
                })
                listDocument.save()
                res.redirect('/'+customListName)
            } else {
                res.render("list",{listTitle:listFound.name,itemArray:listFound.items})
            }
            
        } 
    })
    
})


app.post('/delete',function(req,res){
    const checkedItemId = req.body.checkDelete
    const listName = req.body.list

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(!err){
                console.log("successful")
            } else {
                console.log("couldnt delete")
            }
        })
        res.redirect('/')
    } else {
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
            if(!err){
                res.redirect("/"+listName)
            }
        })
    }
    
})
app.post('/',function(req,res){
    
    const itemName = req.body.newitem;
    const listName = req.body.list
    const newItem = new Item({
        name:itemName
    })
    if(listName === "Today"){
        newItem.save()
        res.redirect('/')
    } else {
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(newItem)
            foundList.save()
            res.redirect("/"+listName)
        })
    }
     
    
})
app.get('/about',function(req,res){
    res.render("about")
})
let port = process.env.port
if(port == null || port =="") {
    port =3000
}
app.listen(port,function(){
    console.log("listening to"+port)
})