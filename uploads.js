
import express from 'express';
const router = express.Router();
router.post('/sign', (req,res)=>res.json({uploadUrl:'', publicUrl:''}));
export default router;
