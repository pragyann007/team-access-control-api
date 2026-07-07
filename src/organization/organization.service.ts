import { ConflictException, Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';

@Injectable()
export class OrganizationService {
    constructor(
        private readonly db:DbService
    ){
    }

    async createOrganization(data,user){
        console.log(user)
        if(!data.slug){
            data.slug = data.name.toLowerCase()
        }
        const dataPayload = {
            name:data.name,
            slug:data.slug,
            ownerId:user.sub,
            
        }
        const exists = await this.db.findOrganization(dataPayload.name,dataPayload.ownerId)

        if(exists){
            throw new ConflictException("Organization already exists")
        }

        // const organization = await this.db.createOrganization(dataPayload);



       
        // const membership = await this.db.createMemberships(membershipPayload)


        const dataPayloads = {
            organization:{
                name:data.name,
                slug:data.slug,
                ownerId:user.sub,

            },
            roles:{
                name:"OWNER"
            },
        }


        const datas  = await this.db.createOrganizationsAndMemberships(dataPayloads)


        return {message:"Organization and memberships Created Succesfully",datas}



    }

    async inviteMemerToOrganization(data,user){
        

        return ;


    }
}
