import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { SignUpDto } from './dto';
import { ConflictMessage, PublicMessage } from 'src/common/enums/message.enum';
import { genSalt, hash } from 'bcrypt';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userReposiotry: Repository<UserEntity>,
    private readonly tokenService:TokenService
  ) {}
  async signUp(signUpDto: SignUpDto) {
    let { email, fullname, password } = signUpDto;
    const user = await this.userReposiotry.findOne({ where: { email } });
    if (user) throw new ConflictException(ConflictMessage.Account);
    // hashed password
    const salt = await genSalt(16);
    const hashedPass = await hash(password, salt);
    // save to db user
    const newUser = this.userReposiotry.create({
      email,
      fullname,
      hashedPassword: hashedPass,
    });
    const savedUser = await this.userReposiotry.save(newUser);
    // create jwt for user
    let token=this.tokenService.createJwtTokn({userId:savedUser.id});
    return {
        message:PublicMessage.SignUp,
        token,
    }
  }
}
