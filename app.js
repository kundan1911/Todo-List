
//to establish the server(the one which communicate with other servers ,i.e browser and all)
const express=require("express")
// to use the mongoose (this communicate with the local database (mongoDB which have its space for collections , then insert the document into it)
const mongoose =require("mongoose")
//for string manipulation we use the lodash module
const _=require("lodash")
// to extract the input values from the request,
const bodyParser=require("body-parser");
// a local module which provides the current data
const date=require(__dirname + "/views/date.js")
// set the app ,i.e  server 
const app=express()
// to let the mongoose access the local mongospace
// if todoDB absent create new,else use the existing
mongoose.connect("mongodb+srv://admin-kundan:Test123@cluster0.0qyqn.mongodb.net/todoDB")
// make the server ,set a ejs file at the background which would be 
// used for templating(structure with dynamic data)
app.set('view engine', 'ejs');
// make our server use the bodyParser ,as the form contains the user data
// we use the .urlencoded method,we extract form data from request
app.use(bodyParser.urlencoded({extended:true}))
// the public folder  hosted along with other default hosted file 
app.use(express.static("public"));

// defines the  structure of the document of the collection
const taskSchema=mongoose.Schema({
  name:{
    type:String,
    required:[true,"no task given"]
  }
})
// to have a dynamic list generation ,which displays a list
// as per the parameter provided in the url we use a new 
// separate schema which contains the name of requrired list and the array of document(tasks)
const customListSchema=mongoose.Schema({
  name:String,
  itemList:[taskSchema]
})
// to actual create a collection in the database
const Task=mongoose.model("task",taskSchema);
const List=mongoose.model("list",customListSchema);

// default initial document to specify the working 
const item1=new Task({
  name:"Welcome to my todo list"
})
const item2=new Task({
  name:"input a new task and hit '+'"
})
const item3=new Task({
  name:"<-- hit this to delete"
})
const defaultItem=[item1,item2,item3];


// to receive an request on the home route,as a get request is received the callback is invoked
app.get("/",function(req,res){
   const day=date.getday();
    // this would render and send the .ejs file present in the views directory ,i.e index
    // the object provided along have key-value pair ,in which key are 
    // used in the .ejs file and value  provided by server get's substituted   at the key-places in ejs
    // hence dynamism ,remember for each variable used in .ejs a value must be passed through the object 
    
    // to read the already present data in the collection in the database
    // basically, retrieve all the document present in the Task collection
    // initially,no document present ,then we push the default documents
    //then we render the ejs with the listtitle and a present documents of database
    Task.find({},function(err,tasks){
      if(err){
        console.log(err)
      }
      else{
        if(!tasks.length){
          Task.insertMany(defaultItem,function(err){
            if(err){
              console.log(err)
            }
            else{
              console.log("added many")
            }
          })
        }
        res.render('index',{listTitle:day,taskItem :tasks })
      }
    
    })
   
})
//for dynamic web-page handling
app.get("/:name",function(req,res){
  // now extract the name from the url
  var parameter=_.capitalize(req.params.name);
  //this scans the collection in the connected database 
  // and depending on filter pass the documents is searched , passed it if founded
  //else pass an empty document
  //initially, if the demanded list does not exist ,it creates a new list document pass the list name and default array(which have task document)
  // if list is present, we simply render the ejs file with the list name and tasks fields
 //this search the List for the required document ,if hit invoke the callback and pass the saved list
 //this list is then send to the ejs for rendering to display the listname and the list tasks
 List.findOne({name:parameter},function(err,tasks){
   if(!err){
      if(tasks){
   res.render("index",{listTitle:parameter,taskItem :tasks.itemList })
      }
      else{ 
        const list=new List({
        name:parameter,
        itemList:defaultItem
      })
        list.save();
        res.redirect("/"+parameter)
      }
    }
  })
  
})
app.get("/contact",function(req,res){
  res.render("contact.ejs")
})
// to allow the server to accept data from the browser(or other server )
app.post("/",function(req,res){
  //as a post request is recerived we need to extract few info provided by the user
  // for easy extraction we use body parser in urlencoded mode as form data is present in the request
  // form data contains the input text value and the button value provided by us by the user info
  const currentList=req.body.listName
  const itemName=req.body.taskName
  //both the collection default task and list one contains the same schema document but in different way
  // for default task collection,the document itself contains the task name the its collection is the list
  // for Lists collection ,each document is an custom list and each have a name and an array of tasks
  const task=new Task({
    name:itemName
  })
  if(currentList===date.getday()){
 
  task.save();
  // this redirects meaning send a request to the server home route
  res.redirect("/")
}
else{
  // for custom List we need to first find the current active list and add the new task to its array  and save it
  // as soon matched, the callback is invoked where the active list is passed
List.findOne({name:currentList},function(err,list){
  if(!err){
    list.itemList.push(task)
    list.save();
    res.redirect("/"+currentList)
  }
})
}
})
// we generally allow to post on the same route ,but we cleverly segregate the data and push onto the specific database

// this post is the one which govern's the deletion of the task of the specific list
// for deletion , first the list name is required and the id of the task is required
app.post("/delete",function(req,res){
  var id=req.body.checkbox;
  var listName=req.body.listName
  if(listName===date.getday()){
  Task.deleteOne({_id:id},function(err){
    if(err){
      console.log(err) 
    }
    else{
      console.log("deleted successfully")
    }
    res.redirect("/")
  })
  }
  else{
    //this search the collection and update the specific list
    //first the filter to narrow down on the list,then apply the second parameter
    // which defines the update,which pull the specific task that have the id provided
 List.findOneAndUpdate({name:listName},{$pull:{itemList:{_id:id}}},function(err){
  if(!err){
    res.redirect("/"+listName)
  }
 })
  }
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
// the server is set at 3000 port 
app.listen(port,function(){
    console.log("server is monitoring the 3000 port")
})

