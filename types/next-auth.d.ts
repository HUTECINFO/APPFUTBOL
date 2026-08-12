import type { RolUsuario } from "@/lib/auth";
import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: RolUsuario;
  }

  interface Session {
    user: {
      id: string;
      role: RolUsuario;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: RolUsuario;
  }
}
