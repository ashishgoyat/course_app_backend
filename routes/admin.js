const { Router } = require("express");
const bcrypt = require("bcrypt");
const {z} = require("zod");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const {rateLimit} = require("express-rate-limit");
const {User,Course, Purchase} = require("../database/db");
const adminmiddleware = require("../middlewares/adminmiddleware");
const adminrouter = Router();

const loginlimiter = rateLimit({
    windowMs: 10*60*1000,
    max:5
})


adminrouter.post('/signup',async function (req,res){
    if (req.headers["admin-secret"] !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ message: "Unauthorized" });
    }

    const requiredbody = z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().max(20)
    })

    const parsedata = requiredbody.safeParse(req.body);
    if(!parsedata.success){return res.status(400).json(parsedata.error)};

    const {email,password, name} = req.body;
    const hashed_password = await bcrypt.hash(password,10);

    try{
        const existinguser = await User.findOne({email});
        if(existinguser){
            return res.status(409).json({message:"Admin already exists"});
        }
        await User.create({email,password: hashed_password,name,role: "admin"});
        res.json({message:"Admin Created"});
    }catch{
        res.status(500).json({message:"Signup failed try again"});
    }
});

adminrouter.post('/login', loginlimiter, async function(req,res){
    const requiredbody = z.object({
        email: z.string().email(),
        password: z.string().min(8)
    })

    const parsedata = requiredbody.safeParse(req.body);
    if(!parsedata.success){return res.status(400).json(parsedata.error)};

    const {email,password} = req.body;

    try{
        const user = await User.findOne({email,role:"admin"})
        if(user){
            const passwordmatch = await bcrypt.compare(password,user.password);
            if(passwordmatch){
                const token = jwt.sign({id:user._id.toString(),role:"admin"},process.env.JWT_SECRET, {expiresIn: "1h"});
                res.json({token});
            }
            else{
                res.status(400).json({message:"Incorrect Password"});
            }
        }
        else{
            res.status(401).json({message:"Admin not found"});
        }
    }catch{
        res.status(500).json({message:"Login failed try again"});
    }
})

adminrouter.get('/course', adminmiddleware, async function (req,res) {
    try{
        const courses = await Course.find({adminId:req.currentuserId});
        res.json({courses});
    }catch{
        res.status(500).json({message:"Error while fetching try again"});
    }
})

adminrouter.get('/course/:id', adminmiddleware, async function (req,res) {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({ message: "Invalid ID" });
    }

    try{
        const course = await Course.findOne({_id: id,adminId:req.currentuserId});
        if(!course){
            return res.status(404).json({message:"no course found"});
        }
        res.json({course});
    }
    catch{
        res.status(500).json({message:"Error while fetching"});
    }
})

adminrouter.post('/course', adminmiddleware, async function(req,res){
    const requiredbody = z.object({
        name: z.string().min(3).max(100),
        description: z.string().max(1000),
        price: z.coerce.number().min(0),
        image: z.string().url(),
    })

    const paresedata = requiredbody.safeParse(req.body);
    if(!paresedata.success){
        return res.status(400).json(paresedata.error);
    }
    const {name,description,price,image} = req.body;

    try{
        await Course.create({name,description,price,image,adminId:req.currentuserId});
        res.json({message:"Course created successfully"});
    }catch{
        res.status(500).json({message:"Error while creating try again"});
    }
})

adminrouter.put('/course/:id', adminmiddleware, async function(req,res){
    const requiredbody = z.object({
        name: z.string().min(3).max(100),
        description: z.string().max(1000),
        price: z.coerce.number().min(0),
        image: z.string().url()
    })

    const paresedata = requiredbody.safeParse(req.body);
    if(!paresedata.success){
        return res.status(400).json(paresedata.error)
    }

    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({ message: "Invalid ID" });
    }

    const {name,description,price,image} = req.body;
    try{
        const updatedcourse = await Course.findOneAndUpdate({_id:id, adminId:req.currentuserId},{name,description,price,image},{new:true});
        if(!updatedcourse){
            return res.status(404).json({message:"Course not found"});
        }
        return res.json({message:"Course updated"});
    }catch{
        res.status(500).json({message:"Error while updating course try again"});
    }
})

adminrouter.delete('/course/:id', adminmiddleware, async function(req,res){
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({ message: "Invalid ID" });
    }
    
    try{
        const deletedcourse = await Course.findOneAndDelete({_id:id, adminId:req.currentuserId});
        if(!deletedcourse){
            return res.status(404).json({message:"Course not found"});
        }

        await Purchase.deleteMany({courseId:id});
        res.json({message:"Course and related purchases deleted"});
    }catch{
        res.status(500).json({message:"Error while deleting try again"});
    }
})


module.exports = adminrouter;