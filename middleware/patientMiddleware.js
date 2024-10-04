import rateLimit from 'express-rate-limit'

export const patientAuthInfo = async(req,res,next)=>{
        const token = req.header('Authorization').replace('Bearer','')
        console.log(token)
        next()
}



export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  
    max: 2,  
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,  
    legacyHeaders: false, 
    handler: (req, res, next, options) => {
   
        console.log(`Rate limit exceeded for IP: ${req.ip}`);


        res.status(options.statusCode).json({
            message: options.message
        });
    }
})

export const check  =async(req,res)=>{
  res.send('this is limit api')
}