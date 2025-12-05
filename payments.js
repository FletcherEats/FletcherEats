
import express from 'express';
const router = express.Router();
router.post('/', (req,res)=>res.json({url:'https://checkout.stripe.com/demo'}));
export default router;
