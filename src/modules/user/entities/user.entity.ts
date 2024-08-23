import { BaseEntity } from 'src/common/abstracts/baseEntity.abstract';
import { EntityName } from 'src/common/enums';
import { Column, Entity } from 'typeorm';
@Entity(EntityName.User)
export class UserEntity extends BaseEntity {
  @Column({})
  fullname: string;
  @Column({ unique: true })
  email: string;
  @Column()
  hashedPassword: string;
}
