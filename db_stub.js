const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const DATA = path.join(__dirname,'data.json');
async function read(){ const raw = await fs.readFile(DATA,'utf8'); return JSON.parse(raw); }
async function write(d){ await fs.writeFile(DATA, JSON.stringify(d,null,2),'utf8'); }
module.exports = {
  async createUser(u){ const d = await read(); d.users = d.users||[]; u.id = uuidv4(); d.users.push(u); await write(d); return u; },
  async findUserByEmail(email){ const d = await read(); return (d.users||[]).find(x=>x.email===email); },
  async getRestaurants(){ const d = await read(); return d.restaurants||[]; },
  async addRestaurant(r){ const d = await read(); r.id = (d.restaurants.reduce((m,x)=>Math.max(m,x.id),0)||0)+1; r.menu = r.menu||[]; d.restaurants.push(r); await write(d); return r; },
  async createOrder(order){ const d = await read(); d.orders = d.orders||[]; const id = uuidv4(); const o = { id, createdAt:new Date().toISOString(), status: order.status || 'received', driver:null, ...order }; d.orders.push(o); await write(d); return o; },
  async getOrderById(id){ const d = await read(); return (d.orders||[]).find(x=>String(x.id)===String(id)); },
  async getPendingOrders(){ const d = await read(); return (d.orders||[]).filter(o=>o.status==='received' || o.status==='assigned'); },
  async assignDriver(id, driver){ const d = await read(); const o = (d.orders||[]).find(x=>String(x.id)===String(id)); if(!o) throw new Error('not found'); o.driver = driver; o.status='assigned'; o.driverAccepted = true; await write(d); return o; },
  async updateOrderStatus(id, status){ const d = await read(); const o = (d.orders||[]).find(x=>String(x.id)===String(id)); if(!o) throw new Error('not found'); o.status = status; await write(d); return o; },
  async getAllOrders(){ const d = await read(); return d.orders||[]; }
};
