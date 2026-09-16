const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
const DB_FILE = './db.json';
function readDB(){ try{ return JSON.parse(fs.readFileSync(DB_FILE)); } catch{ return []; } }
function writeDB(d){ fs.writeFileSync(DB_FILE, JSON.stringify(d,null,2)); }
function getFreshFoods(){
  let foods = readDB(); let now = Date.now();
  let fresh = foods.filter(f => !f.createdAt || (now - f.createdAt) < 78000000);
  if(fresh.length !== foods.length) writeDB(fresh);
  return fresh;
}
app.get('/api/foods',(req,res)=>{ res.json(getFreshFoods()); });
app.post('/api/foods',(req,res)=>{
  let foods = readDB();
  foods.push({ id: Date.now(), food: req.body.food, quantity: req.body.quantity, address: req.body.address, phone: req.body.phone, createdAt: Date.now() });
  writeDB(foods); res.json({ok:true});
});
app.post('/api/foods/:id/claim',(req,res)=>{
  let foods = getFreshFoods(); let id = parseInt(req.params.id);
  foods = foods.filter(f=> f.id !== id); writeDB(foods); res.json({ok:true});
});
app.get('/',(req,res)=>{ res.sendFile(path.join(__dirname,'index.html')); });
const PORT = process.env.PORT || 5001;
app.listen(PORT,()=>console.log('Server on '+PORT));
