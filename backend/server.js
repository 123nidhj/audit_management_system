console.log('1.0');
const express = require('express');
console.log('1.1');
const cors    = require('cors');
console.log('1.2');
const path    = require('path');
console.log('1.3');
require('dotenv').config();
console.log('1.4');

console.log('2. Creating app...');
const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));

console.log('3.0 Loading auth route...');
app.use('/api/auth',         require('./routes/auth'));
console.log('3.1 Loading audits route...');
app.use('/api/audits',       require('./routes/audits'));
console.log('3.2 Loading ncs route...');
app.use('/api/ncs',          require('./routes/ncs'));
console.log('3.3 Loading masters route...');
app.use('/api/masters',      require('./routes/masters'));
console.log('3.4 Loading reports route...');
app.use('/api/reports',      require('./routes/reports'));
console.log('3.5 Loading observations route...');
app.use('/api/observations', require('./routes/observations'));

console.log('4. Setting up fallback...');
// Fallback to frontend
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/')) {
    return res.sendFile(path.join(__dirname, '../frontend/index.html'));
  }
  next();
});

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`MTL Audit Server running on http://localhost:${PORT}`);
});
server.on('error', (err) => console.error('Server listen error:', err));

