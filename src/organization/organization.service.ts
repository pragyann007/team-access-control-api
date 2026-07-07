import { ConflictException, Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';

@Injectable()
export class OrganizationService {
    constructor(
        private readonly db:DbService
    ){
    }

    async createOrganization(data,user){
        if(!data.slug){
            data.slug = data.name.toLowerCase()
        }
        const dataPayload = {
            name:data.name,
            slug:data.slug,
            ownerId:user.id,
            
        }
        const exists = await this.db.findOrganization(dataPayload.name,dataPayload.ownerId)

        if(exists){
            throw new ConflictException("Organization already exists")
        }

        // const organization = await this.db.createOrganization(dataPayload);



        const membershipPayload = {
            userId:dataPayload.ownerId,
            roleId:1,     
        }
        // const membership = await this.db.createMemberships(membershipPayload)


        const dataPayloads = {
            organization:{
                name:data.name,
                slug:data.slug,
                ownerId:user.id,

            },
            roles:{
                name:"OWNER"
            },
        }


        const datas  = await this.db.createOrganizationsAndMemberships(dataPayloads)


        return {message:"Organization and memberships Created Succesfully",datas}



    }
}
