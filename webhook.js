
import express from 'express';
const router = express.Router();
router.post('/stripe', (req,res)=>res.json({received:true}));
export default router;
