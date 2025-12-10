const { MongoClient, ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('MONGODB_URI required for db_mongo');
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let db;
async function ready(){ if(!db){ await client.connect(); db = client.db(process.env.MONGODB_DB || 'fletcher_eats'); } }
module.exports = {
  async createUser(u){ await ready(); const res = await db.collection('users').insertOne(u); u._id = res.insertedId; return u; },
  async findUserByEmail(email){ await ready(); return db.collection('users').findOne({ email }); },
  async getRestaurants(){ await ready(); return db.collection('restaurants').find().toArray(); },
  async addRestaurant(r){ await ready(); await db.collection('restaurants').insertOne(r); return r; },
  async createOrder(order){ await ready(); const o = { ...order, status: order.status || 'received', createdAt: new Date() }; const res = await db.collection('orders').insertOne(o); o._id = res.insertedId; return o; },
  async getOrderById(id){ await ready(); const _id = typeof id==='string'&&id.length===24 ? ObjectId(id): id; return await db.collection('orders').findOne({ _id }) || await db.collection('orders').findOne({ id }); },
  async getPendingOrders(){ await ready(); return await db.collection('orders').find({ status: { $in: ['received','assigned'] } }).toArray(); },
  async assignDriver(id, driver){ await ready(); const _id = typeof id==='string'&&id.length===24 ? ObjectId(id): id; await db.collection('orders').updateOne({ _id }, { $set: { driver, status:'assigned', driverAccepted:true } }); return await db.collection('orders').findOne({ _id }); },
  async updateOrderStatus(id, status){ await ready(); const _id = typeof id==='string'&&id.length===24 ? ObjectId(id): id; await db.collection('orders').updateOne({ _id }, { $set: { status } }); return await db.collection('orders').findOne({ _id }); },
  async getAllOrders(){ await ready(); return await db.collection('orders').find().toArray(); }
};
