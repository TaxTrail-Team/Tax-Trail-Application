// import { Request, Response, NextFunction } from "express";
// import { ENV } from "../config/env";

// export function requireAdmin(req: Request, res: Response, next: NextFunction) {
//   if (req.header("X-Admin-Secret") !== ENV.ADMIN_SECRET) {
//     return res.status(403).json({ error: "Forbidden" });
//   }
//   next();
// }
