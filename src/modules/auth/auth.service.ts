import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { SignInDto, SignUpDto } from './dto';
import { AuthMesssge, ConflictMessage, PublicMessage } from 'src/common/enums/message.enum';
import { compare, genSalt, hash } from 'bcrypt';
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

  async signIn(signInDto:SignInDto){
    let {email,password}=signInDto;
    const user=await this.userReposiotry.findOneBy({email});
    const checkPassword=await compare(password,user.hashedPassword);
    if(!user || !checkPassword) throw new UnauthorizedException(AuthMesssge.InCurrentPasswordOrEmail);

    // create token
    const token=this.tokenService.createJwtTokn({userId:user.id})

    return {
        message:PublicMessage.SignIn,
        token
    }
  }
}
