import { BaseEntity } from "src/common/abstracts/baseEntity.abstract";
import { EntityName } from "src/common/enums";
import { Column, Entity, OneToMany } from "typeorm";
import { MessageEntity } from "./message.entity";

@Entity(EntityName.Room)
export class RoomEntity extends BaseEntity {
    @Column({nullable:true})
    name:string
    @Column()
    type:string
    @Column()
    createdBy:string

    @OneToMany(()=>MessageEntity,msg=>msg.room)
    messages:MessageEntity[]

}