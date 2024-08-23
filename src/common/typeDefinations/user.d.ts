import { IUser } from "src/modules/user/interfaces";

declare global {
    namespace Express {
        interface Request {
            user?:IUser
            
        }
    }
}

