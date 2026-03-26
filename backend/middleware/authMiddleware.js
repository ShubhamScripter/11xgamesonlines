import jwt from "jsonwebtoken";
import SubAdmin from "../models/subAdminModel.js";

export const authMiddleware = async (req, res, next) => {
    let token;
   
    //   Check if the token is in the Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1]; // Extract token from Bearer header
    } else if (req.cookies.auth) {
        token = req.cookies.auth; // Extract token from cookies
    }

    if (!token) {
        return res.status(401).json({ error: "Authentication required" });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
       
        const userRole = decodedToken.role;

        if (!userRole || userRole !== "user") {
            return res.status(403).json({ message: "Access denied, Only user can access" });
        }

       
        const user = await SubAdmin.findById(decodedToken.id);
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        // ADD NULL CHECK FOR sessionToken
        if (!decodedToken.sessionToken || !user.sessionToken) {
            return res.status(401).json({
                message: "Session expired. Please login again.",
                code: "SESSION_EXPIRED"
            });
        }

        if (user.sessionToken !== decodedToken.sessionToken) {
            return res.status(401).json({
                message: "Session expired. Please login again.",
                code: "SESSION_EXPIRED"
            });
        }

        req.role = decodedToken.role;
        req.user = decodedToken.user;
        req.id = decodedToken.id;
        console.error("🔵 MIDDLEWARE: ✅ Calling next() - controller should run");
       

        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};


export const adminAuthMiddleware = async (req, res, next) => {
    try {
        let token;

        //  Check if token exists in Authorization header or cookies
        if (req.headers.authorization?.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies.auth) {
            token = req.cookies.auth;
        }

        // console.log("Token received:", token);

        if (!token) {
            return res.status(401).json({ error: "Authentication required" });
        }

        //  Verify token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        console.log("my token is:",decodedToken);
        const userRole = decodedToken.role;

         console.log("User role:", userRole);

        //  Allow only specified roles
        const allowedRoles = ['superadmin','admin', 'subadmin', 'seniorSuper', 'superAgent', 'agent', 'user'];
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: "Access denied, admin only" });
        }

        // console.log("token11111", decodedToken);

        const user = await SubAdmin.findById(decodedToken.id);
        // Check session token validity
        if (user.sessionToken !== decodedToken.sessionToken) {
            return res.status(401).json({
                message: "Session expired. Please login again.",
                code: "SESSION_EXPIRED"
            });
        }


        req.role = userRole;
        req.id = decodedToken.id;
        req.admin = decodedToken.user;
        console.error("🔵 MIDDLEWARE: ✅ Calling next() - controller should run");
        next();
    } catch (error) {
        console.error("Admin Auth Error:", error);
        res.status(401).json({ message: "Invalid token" });
    }
};



