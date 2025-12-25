import { Request } from "express";
import { IUser } from "../models/UserModel";

export interface AuthRequest extends Request {
  user?: IUser;
}
