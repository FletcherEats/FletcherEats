
import express from 'express';
const router = express.Router();
router.post('/assign', (req,res)=>res.json({message:'assigned'}));
router.post('/status', (req,res)=>res.json({message:'status updated'}));
router.get('/orders', (req,res)=>res.json([]));
export default router;
