const jwt=require('jsonwebtoken');
module.exports=(req,res,next)=>{try{req.auth=jwt.verify((req.headers.authorization||'').replace(/^Bearer /,''),process.env.SECRET_KEY);next();}catch{res.status(401).json({message:'Please sign in again to continue.'});}};
