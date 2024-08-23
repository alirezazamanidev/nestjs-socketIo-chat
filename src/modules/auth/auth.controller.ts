import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiConsumes, ApiTags } from "@nestjs/swagger";
import { ContentType, SwaggerTags } from "src/common/enums";
import { AuthService } from "./auth.service";
import { SignInDto, SignUpDto } from "./dto";

@ApiTags(SwaggerTags.Auth)
@Controller('auth')
export class AuthController {

    constructor(private readonly authService:AuthService){}

    @HttpCode(HttpStatus.CREATED)
    @Post('signUp')
    @ApiConsumes(ContentType.UrlEncoded,ContentType.Json)
    signUp(@Body() signUpDto:SignUpDto){
        return this.authService.signUp(signUpDto);

    }
    @HttpCode(HttpStatus.OK)
    @Post('signIn')
    @ApiConsumes(ContentType.UrlEncoded,ContentType.Json)
    signIn(@Body() signInDto:SignInDto){
        return this.authService.signIn(signInDto);

    }

}