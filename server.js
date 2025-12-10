/**
 * Fletcher Eats Backend (real-time)
 * - Express + HTTP server + Socket.IO
 * - JWT auth (admin & driver)
 * - File uploads (multer) for receipts
 * - DB: MongoDB adapter (db_mongo) or file fallback (db_stub)
 * - CORS enabled to allow Netlify frontend to talk to it (configure allowed origins in production)
 */
const express = require('express');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const SECRET = process.env.JWT_SECRET || 'change_this_secret';
const useMongo = !!process.env.MONGODB_URI;
const db = useMongo ? require('./db_mongo') : require('./db_stub');
const app = express();
app.use(bodyParser.json());
app.use(cors()); // allow all origins for convenience; restrict in production
app.use(express.static(path.join(__dirname, '..', 'frontend')));

const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });

// simple socket map for driver sockets
const driverSockets = new Map();

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
  // driver joins with token and role driver
  socket.on('driver:join', (data) => {
    // data should include driverId
    const { driverId } = data || {};
    if (driverId) {
      driverSockets.set(driverId, socket.id);
      socket.driverId = driverId;
      console.log('driver joined', driverId);
    }
  });
  // driver sends location updates
  socket.on('driver:location', (data) => {
    // broadcast driver location to order room or all clients
    const { driverId, lat, lng } = data || {};
    io.emit('driver:location', { driverId, lat, lng });
  });
  // when order status updates server-side, server will emit order:update event
  socket.on('disconnect', () => {
    if (socket.driverId) driverSockets.delete(socket.driverId);
    console.log('socket disconnected', socket.id);
  });
});

function createToken(user){ return jwt.sign({ sub: user.id || user._id, role: user.role, name: user.name }, SECRET, { expiresIn: '12h' }); }
function auth(role){ return (req,res,next)=>{ const h = req.headers.authorization; if(!h) return res.status(401).json({error:'no token'}); const token = h.split(' ')[1]; try{ const data = jwt.verify(token, SECRET); if(role && data.role!==role) return res.status(403).json({error:'forbidden'}); req.user = data; next(); }catch(e){ return res.status(401).json({error:'invalid token'}); } }; }

app.get('/api/health', (req,res)=> res.json({ok:true, mongo: useMongo}));

// Register (admin/driver) - protect in production
app.post('/api/auth/register', async (req,res)=>{
  const { email, password, name, role } = req.body;
  if(!email||!password||!role) return res.status(400).json({error:'email,password,role required'});
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.createUser({ email, name, role, passwordHash });
  res.json({ ok:true, user });
});

// Login
app.post('/api/auth/login', async (req,res)=>{
  const { email, password } = req.body;
  const user = await db.findUserByEmail(email);
  if(!user) return res.status(401).json({error:'invalid'});
  const valid = await bcrypt.compare(password, user.passwordHash || user.password || '');
  if(!valid) return res.status(401).json({error:'invalid'});
  const token = createToken(user);
  res.json({ token, role: user.role, name: user.name, id: user.id || user._id });
});

// Restaurants
app.get('/api/restaurants', async (req,res)=>{ const r = await db.getRestaurants(); res.json(r); });
app.post('/api/restaurants', auth('admin'), async (req,res)=>{ const added = await db.addRestaurant(req.body); res.json(added); });

// Orders - customers create (message + optional receipt + location)
app.post('/api/orders', upload.single('receipt'), async (req,res)=>{
  try {
    const payload = req.body;
    if(req.file) payload.receipt = req.file.filename;
    payload.paymentMethod = 'cash';
    payload.status = 'received';
    const created = await db.createOrder(payload);
    // emit event to admin/driver dashboards
    io.emit('order:created', created);
    res.status(201).json(created);
  } catch(e){ console.error(e); res.status(500).json({error:'create failed'}); }
});

app.get('/api/orders/:id', async (req,res)=>{
  const o = await db.getOrderById(req.params.id);
  if(!o) return res.status(404).json({error:'not found'});
  res.json(o);
});

// Driver endpoints (multiple drivers)
app.get('/api/driver/orders', auth('driver'), async (req,res)=>{
  const list = await db.getPendingOrders(); res.json(list);
});

app.post('/api/driver/orders/:id/accept', auth('driver'), async (req,res)=>{
  const driver = { id: req.user.sub, name: req.user.name };
  const updated = await db.assignDriver(req.params.id, driver);
  // emit order update to clients
  io.emit('order:updated', updated);
  res.json(updated);
});

app.post('/api/driver/orders/:id/status', auth('driver'), async (req,res)=>{
  const status = req.body.status;
  const updated = await db.updateOrderStatus(req.params.id, status);
  io.emit('order:updated', updated);
  res.json(updated);
});

// Admin endpoints
app.get('/api/admin/orders', auth('admin'), async (req,res)=>{
  const all = await db.getAllOrders(); res.json(all);
});

app.post('/api/admin/orders/:id/assign', auth('admin'), async (req,res)=>{
  const driver = req.body.driver; const updated = await db.assignDriver(req.params.id, driver); io.emit('order:updated', updated); res.json(updated);
});

// Serve frontend
app.get('*', (req,res)=> res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html')) );

const PORT = process.env.PORT||3000;
server.listen(PORT, ()=> console.log('Fletcher Eats backend listening on', PORT));
