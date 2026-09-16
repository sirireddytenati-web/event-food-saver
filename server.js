const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '..')));

const DATA_FILE = './data.json';
function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return data ? JSON.parse(data) : [];
  } catch (e) { return []; }
}
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/foods', (req, res) => {
  res.json(readData());
});

app.post('/api/foods', (req, res) => {
  const foods = readData();
  const newFood = { id: Date.now().toString(), ...req.body, claimed: false };
  foods.push(newFood);
  writeData(foods);
  res.json(newFood);
});

app.put('/api/foods/:id/claim', (req, res) => {
  const foods = readData();
  const food = foods.find(f => f.id === req.params.id);
  if (food) { food.claimed = true; writeData(foods); }
  res.json(food);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
