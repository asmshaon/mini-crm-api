import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { createClient } from "@supabase/supabase-js";

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
  );

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");

    try {
      const { data, error } = await this.supabase.auth.getUser(token);

      if (error || !data.user) {
        throw new UnauthorizedException("Invalid token");
      }

      // Attach user to request
      request["user"] = {
        sub: data.user.id,
        email: data.user.email,
      };

      // Store raw token for creating auth-aware Supabase client
      request["token"] = token;

      return true;
    } catch {
      throw new UnauthorizedException("Invalid token");
    }
  }
}
