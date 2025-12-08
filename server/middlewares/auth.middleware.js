import jwt from 'jsonwebtoken'
export const AuthMiddleware = (req, res, next) => {

    console.log(req)

    // console.log(req.cookies.manzilini)
   
 
        try {
             const token = req.cookies.manzilini;

             if(!token){
                return res.status(401).json({
                    message : "UnAuthorized"
                })
             }
            

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = decoded.user;

            next();
        } catch (error) {
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }
