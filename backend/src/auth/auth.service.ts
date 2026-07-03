import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";

@Injectable()
export class AuthService {
  // Hash du mot de passe admin
  // Utilise la variable d'environnement ADMIN_PASSWORD_HASH
  // Par défaut en dev: "admin123"
  private readonly ADMIN_PASSWORD_HASH =
    process.env.ADMIN_PASSWORD_HASH ||
    "$2b$10$/9LqI2.zKZrDfWIdhcX3HOpqgwanTTQZpD66XHZ8ww9z/8DjUD/76"; // Hash de "admin123" pour dev

  constructor(private jwtService: JwtService) {}

  async login(password: string) {
    // Vérifier le mot de passe
    const isValid = await bcrypt.compare(password, this.ADMIN_PASSWORD_HASH);

    if (!isValid) {
      throw new UnauthorizedException("Mot de passe incorrect");
    }

    // Générer un JWT
    const payload = { role: "admin", timestamp: Date.now() };
    const token = await this.jwtService.signAsync(payload);

    return {
      success: true,
      token,
    };
  }

  async verify(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      return {
        valid: true,
        role: payload.role,
      };
    } catch {
      return {
        valid: false,
      };
    }
  }

  // Méthode utilitaire pour générer un hash (à utiliser en dev pour créer le hash)
  async generateHash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
