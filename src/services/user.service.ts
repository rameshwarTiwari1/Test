import { injectable } from "inversify";
import { User } from "../entities/User";

@injectable()
export class UserService {

    getUsers(): User[] {
        return [
            new User('1', 'John Doe', 'johndoe@example.com'),
            new User('2', 'Jane Doe', 'janedoe@example.com'),
        ];
    }
}