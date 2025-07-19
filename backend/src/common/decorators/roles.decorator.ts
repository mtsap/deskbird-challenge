import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../auth/auth-user.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
