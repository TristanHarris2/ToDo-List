const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const DB = require('mongodb');
const app = express();
const _ = require('lodash')

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));

mongoose.connect("mongodb+srv://Tristan:09december@cluster0.jdpy3.mongodb.net/ToDoDataBase", {useNewUrlParser: true});

const itemSchema = {
    name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to your ToDo List"
});

const item2 = new Item({
    name: "Hit the + button to add a new item."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema ={
    name: String,
    items: [itemSchema]
}

const List = mongoose.model("List", listSchema)

app.get("/", function (req, res) {

   Item.find({}, function(err, foundItems) {

       if (foundItems.length === 0) {
                Item.insertMany(defaultItems, function(err){
            if(err){
                console.log(err);
            } else {
                console.log("Successfully saved default items to DB");
            }});
            res.redirect("/");
        } else {
            res.render("List", {listTitle: "Today", newListItems: foundItems});
        }
   });

});

app.get("/:customListName", function(req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList) {
        if (!err){
            if(!foundList) {
                //Create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
            
                list.save();
                res.redirect("/" + customListName)
            } else {
                //Show an existing list
                res.render("List.ejs", {listTitle: foundList.name, newListItems: foundList.items})
            }
        }
    });

    

});

app.post('/', function(req, res){
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name:itemName
    });

    if(listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName)
        });
    }
});

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    
    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function(err){
            if (!err) {
                console.log('successfully deleted checked item.')
                res.redirect("/")
            }
        });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
            if (!err) {
                res.redirect("/" + listName)
            }
        });
    }

    
});



app.post("/work", function(req, res) {
    let item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work")
});

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000
}

app.listen(port, function () {
   console.log("Server started on port 3000.") 
});