import type { AppRole } from '@modules/roles/roles.constants';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: AppRole[];
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  roles: AppRole[];
  isActive: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    roles: AppRole[];
  };
}
