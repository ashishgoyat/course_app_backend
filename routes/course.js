const { Router } = require("express");
const usermiddleware = require("../middlewares/usermiddleware");
const {Course,Purchase} = require("../database/db");
const mongoose = require("mongoose");
const courserouter = Router();


courserouter.get('/', usermiddleware, async function (req,res) {
    try{
        const courses = await Course.find();
        res.json({courses});
    }catch{
        res.status(500).json({message:"Error while fetching try again"});
    }
})

courserouter.get('/purchased', usermiddleware, async function(req,res) {
    try{
        const purchases = await Purchase.find({userId:req.currentuserId});
        const courses = await Course.find({_id:{$in: purchases.map(x => x.courseId)}})
        res.json({courses});
    }catch{
        res.status(500).json({message:"Error while fetching try again"});
    }
})

courserouter.get('/:id', usermiddleware, async function (req,res) {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({ message: "Invalid ID" });
    }
    try{
        const course = await Course.findOne({_id: id});
        if(!course){
            return res.status(404).json({message:"no course found"});
        }
        res.json({course});
    }
    catch{
        res.status(500).json({message:"Error while fetching"});
    }
})

courserouter.post('/purchase/:id', usermiddleware, async function(req,res){
    const id = req.params.id;
    const course = await Course.findById(id);
    if (!course){
       return res.status(404).json({message:"Course not found"});
    }
    try{
        await Purchase.create({courseId:id,userId:req.currentuserId});
        res.json({message:"Course purchased successfully"});
    }catch(err){
        if(err.code === 11000){
            return res.status(409).json({message:"Course already purchased"});
        }
        res.status(500).json({message:"Error while purchasing try again"});
    }
})


module.exports = courserouter;