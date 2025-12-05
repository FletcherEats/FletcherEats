
import express from 'express';
const router = express.Router();
router.post('/join', (req,res)=>res.json({message:'driver join recorded'}));
router.post('/location', (req,res)=>res.json({message:'location received'}));
router.get('/assigned/:driver', (req,res)=>res.json([]));
router.get('/list', (req,res)=>res.json([]));
export default router;
