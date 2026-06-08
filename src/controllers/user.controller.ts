import { controller, httpGet } from "inversify-express-utils";
import { Request, Response } from "express";
import { inject } from "inversify";
import { UserService } from "../services/user.service";

@controller('/users')
export class UserController {
    constructor(
        @inject(UserService) private _userService: UserService
    ) { }

    @httpGet('/')
    async getUsers(req: Request, res: Response) {
        const users = await this._userService.getUsers();
        return res.send(users);
    }
}