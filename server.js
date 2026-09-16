const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = './db.json';

function readDB(){
  try{ return JSON.parse(fs.readFileSync(DB_FILE)); }
  catch{ return []; }
}
function writeDB(d){
  fs.writeFileSync(DB_FILE, JSON.stringify(d));
}
function getFreshFoods(){
  let foods = readDB();
  let now = Date.now();
  let fresh = foods.filter(f => {
    if(!f.createdAt) return true;
    return (now - f.createdAt) < 24*60*60*1000; // 24 hours
  });
  if(fresh.length !== foods.length) writeDB(fresh);
  return fresh;
}

app.get('/api/foods',(req,res)=>{
  res.json(getFreshFoods());
});

app.post('/api/foods',(req,res)=>{
  let foods = readDB();
  foods.push({
    food: req.body.food,
    quantity: req.body.quantity,
    address: req.body.address,
    phone: req.body.phone,
    createdAt: Date.now()
  });
  writeDB(foods);
  res.json({ok:true});
});

app.post('/api/foods/:id/claim',(req,res)=>{
  let foods = getFreshFoods();
  let id = parseInt(req.params.id);
  foods = foods.filter((f,i)=> i !== id);
  writeDB(foods);
  res.json({ok:true});
});

app.listen(5001,()=>console.log('Server on port 5001'));