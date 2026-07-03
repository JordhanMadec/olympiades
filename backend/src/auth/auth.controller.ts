import { Body, Controller, Post, HttpCode, HttpStatus } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post("login")
  async login(@Body() loginDto: { password: string }) {
    return this.authService.login(loginDto.password);
  }

  @HttpCode(HttpStatus.OK)
  @Post("verify")
  async verify(@Body() verifyDto: { token: string }) {
    return this.authService.verify(verifyDto.token);
  }
}
