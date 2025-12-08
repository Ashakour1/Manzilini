export const AuthMiddleware = (req, res, next) => {
   
    let tokan;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            tokan = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(tokan, process.env.JWT_SECRET);

            req.user = decoded.user;

            next();
        } catch (error) {
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!tokan) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
}