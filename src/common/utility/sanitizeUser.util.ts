import { UserEntity } from 'src/modules/user/entities/user.entity';

export const sanitizeUser = (user: UserEntity):any => {
  let { hashedPassword, ...sanitizedUser } = user;
  return sanitizedUser;
};
