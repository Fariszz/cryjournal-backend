import type { AppRole } from '@common/constants/app-role.constants';

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
