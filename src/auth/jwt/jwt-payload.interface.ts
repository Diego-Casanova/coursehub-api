export interface JwtPayload {
  sub: number;
  email: string;
}

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: import('../roles/user-role.enum').UserRole;
}
