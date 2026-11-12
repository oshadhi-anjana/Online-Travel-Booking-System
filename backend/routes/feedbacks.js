const router=require('express').Router();const Feedback=require('../models/feedback');const {wrap}=require('../middleware/errors');
router.get('/',wrap(async(req,res)=>res.json(await Feedback.find().populate('userID','username').sort({createdAt:-1}).limit(100))));
router.use(require('../middleware/auth'));
router.post('/add',wrap(async(req,res)=>{const {location,feedback,rating}=req.body;if(!Number.isInteger(Number(rating))||rating<1||rating>5)return res.status(400).json({message:'Choose a rating from 1 to 5.'});res.status(201).json(await Feedback.create({location,feedback,rating,userID:req.auth.id}));}));
router.get('/getall/:id',wrap(async(req,res)=>{if(req.params.id!==req.auth.id)return res.status(403).json({message:'Access denied.'});res.json({feedback:await Feedback.find({userID:req.auth.id}).populate('userID','username').sort({createdAt:-1})});}));
router.delete('/:id',wrap(async(req,res)=>{const item=await Feedback.findOneAndDelete({_id:req.params.id,userID:req.auth.id});if(!item)return res.status(404).json({message:'Review not found.'});res.json({message:'Review deleted.'});}));module.exports=router;
