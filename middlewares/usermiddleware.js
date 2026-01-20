const jwt = require("jsonwebtoken");

function usermiddleware(req,res,next){
    const token = req.headers.authorization;
    try{
        const response = jwt.verify(token,process.env.JWT_SECRET);
        req.currentuserId = response.id;
        next();
    }catch{
        res.status(403).json({message:"Invalid or Expired token"});
    }
}


module.exports = usermiddleware;