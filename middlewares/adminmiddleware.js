const jwt = require("jsonwebtoken");

async function adminmiddleware(req,res,next){
    const token = req.headers.authorization;

    try{
        const response = await jwt.verify(token,process.env.JWT_SECRET);
        if(response.role !== 'admin'){
            return res.status(403).json({message:"Admin access only"});
        }
        else{
            req.currentuserId = response.id;
            next();
        }
    }catch{
        res.status(401).json({message:"Invalid or Expired token"});
    }
}


module.exports = adminmiddleware;