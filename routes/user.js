const { Router } = require("express");
const bcrypt = require("bcrypt");
const {z} = require("zod");
const jwt = require("jsonwebtoken");
const {rateLimit} = require("express-rate-limit");
const {User} = require("../database/db");
const userrouter = Router();

const loginlimiter = rateLimit({
    windowMs: 1*60*1000,
    max:10
})


userrouter.post('/signup',async function (req,res){

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
            return res.status(409).json({message:"User already exists"});
        }
        await User.create({email,password: hashed_password,name});
        res.json({message:"User Created"});
    }catch{
        res.status(500).json({message:"Signup failed try again"});
    }
});


userrouter.post('/login', loginlimiter, async function(req,res){
    const requiredbody = z.object({
        email: z.string().email(),
        password: z.string().min(8)
    })
    const parsedata = requiredbody.safeParse(req.body);
    if(!parsedata.success){return res.status(400).json(parsedata.error)};

    const {email,password} = req.body;

    try{
        const user = await User.findOne({email})
        if(user){
            const passwordmatch = await bcrypt.compare(password,user.password);
            if(passwordmatch){
                const token = jwt.sign({id:user._id.toString()},process.env.JWT_SECRET,{expiresIn:"1d"});
                res.json({token});
            }
            else{
                res.status(400).json({message:"Incorrect Password"});
            }
        }
        else{
            res.status(401).json({message:"User not found"});
        }
    }catch{
        res.status(500).json({message:"Login failed try again"});
    }
})



module.exports = userrouter;