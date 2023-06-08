//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const _ = require("lodash") ;
// mongoose.set('strictQuery', true);

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const mongoose = require('mongoose') ;
mongoose.connect('mongodb+srv://Diwakarg04:Diwakargupta1@todolist.pdt9vlz.mongodb.net/todolistDB' ,{useNewUrlParser: true}) ;
mongoose.set('strictQuery', true);

const itemSchema = new mongoose.Schema({
  name: String
}) ;

const Item = mongoose.model("Item" , itemSchema) ;

const buy = new Item({
  name: "Buy Food" 
}) ;
const cook = new Item({
  name: "Cook Food"
}) ;
const eat = new Item({
  name: "Eat Food"
}) ;

const defaultitems = [buy , cook , eat] ;

const listSchema = new mongoose.Schema({
  name: String ,
  items: [itemSchema] 
}) ;

const List = new mongoose.model("List" ,listSchema) ;
 

app.get("/", function(req, res) {

const day = date.getDate();
  Item.find({} ,function(err,foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultitems , function(err){
        if(err){
          console.log(err) ;
        }
        else{
          console.log("Successfully Inserted") ;
        }
      }) ;
    }  
    res.render("list", {listTitle: day, newListItems: foundItems});
  }) ;

});
app.get("/:customListName" , function(req,res){
  const para = _.capitalize(req.params.customListName) ;

  List.findOne({name: para} , function(err,foundList){
        if(!err){
          if(!foundList){
            const list = new List({
              name : para ,
              items: defaultitems
            }) ;
            list.save() ;
            res.redirect("/" + para) ;
          }
          else{
            res.render("list" , {listTitle: foundList.name , newListItems: foundList.items}) ;
          }
        }
  }) ;
}) ;
app.post("/", function(req, res){

  const day = date.getDate();
  const itemName = req.body.newItem;
  const listName = req.body.list ;
    
  const item = new Item({
      name : itemName 
    }) ;

    if(listName === day){
      item.save() ;
      res.redirect("/") ;
    }
    else{
      List.findOne({name: listName} , function(err,foundList){
          foundList.items.push(item) ;
          foundList.save() ;
          res.redirect("/" + listName) ;
        
      });
    }
});

app.post("/delete" , function(req,res){
  const checkedItemID = req.body.checkbox ;
  const listName = req.body.listname ;
  const day = date.getDate();

  if(listName === day){
    Item.findByIdAndRemove({name: checkedItemID} , function(err){
        if(err){
          console.log(err) ;
        }
        else{
          console.log("Deleted Checked Item!") ;
          res.redirect("/") ;
        }
      }) ;
  }
  else{
    List.findOneAndUpdate({name: listName} , {$pull : {items : {_id : checkedItemID}}}, function(err,foundList){
      if(!err){
        res.redirect("/" + listName) ;
      }
    }) ;
  }

}) ;

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
