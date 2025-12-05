
import express from 'express';
const router = express.Router();
router.post('/order', (req,res)=>res.json({message:'order placed (demo)'}));
router.get('/orders/:customer', (req,res)=>res.json([]));
export default router;
