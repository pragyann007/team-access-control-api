import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from 'src/db/db.service';

@Injectable()
export class UserService {
    constructor(private readonly db:DbService){}

    async getMe(userId:number){
        const user = await this.db.findUserById(userId);
        if(!user) throw new NotFoundException("User not found")
        return {user}
    }

    async updateMe(userId:number,data){
        const user = await this.db.updateUserProfile(userId,data);
        return {message:"Profile updated sucesfully",user}
    }

    async getMyOrganizations(userId:number){
        const organizations = await this.db.findUserOrganizations(userId);
        return {organizations}
    }
}
