//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose"); 
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb+srv://aryangandhi597:Aryan56@cluster0.7srct9p.mongodb.net/todolistDB');
}

const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "welcome to your todolist!"
});
const defaultItems = [item1];

const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  async function run() {
    try{
    const founditems = await Item.find();
    if (founditems.length === 0){
      await Item.insertMany(defaultItems);
      console.log("success")
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: founditems});
    } 
  }
    finally{
    console.log();
    }
 }
  run().catch(console.dir);
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
  async function run() {
    try{
    const foundList = await List.findOne({name: customListName}).exec();
    if (!foundList){
    const list = new List({
    name: customListName,
    items: defaultItems
     });
     list.save();
     res.redirect("/" + customListName)
    }
    else{
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
    } 
    finally{
    console.log();
    }
 }
  run().catch(console.dir);
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    async function run() {
      try{
      const foundList = await List.findOne({name: listName});
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)
      } 
      finally{
      console.log();
      }
   }
    run().catch(console.dir);    
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = (req.body.checkbox);
  const listName = req.body.listName;
  async function run() {
    try{
    if(listName === "Today"){
    await Item.findByIdAndRemove(checkedItemId);
    res.redirect("/");
      }
      else{
        await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
        res.redirect("/"+ listName);
      }
    } 
    finally{
    console.log();
    }
 }
  run().catch(console.dir);
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});