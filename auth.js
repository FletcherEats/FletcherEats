
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
const router = express.Router();
router.post('/', async (req,res)=>{
  const { action } = req.body;
  if(action==='register') return res.json({message:'register endpoint - implement'});
  if(action==='login') return res.json({token:'demo-token'});
  res.json({error:'invalid'});
});
export default router;
