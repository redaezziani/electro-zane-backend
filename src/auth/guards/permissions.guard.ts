import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from '../permissions/permissions.enum';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { RequestUser } from '../types/auth.types';
import { PermissionsService } from '../permissions/permissions.service';

interface PermissionMetadata {
  permissions: Permission[];
  requireAll?: boolean;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const route = `${request.method} ${request.url}`;

    // Get permissions metadata from both handler and class
    const permissionsMetadata = this.reflector.getAllAndOverride<
      Permission[] | PermissionMetadata
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    this.logger.debug(`Route: ${route}, Has metadata: ${!!permissionsMetadata}`);

    // If no permissions are required, allow access
    if (!permissionsMetadata) {
      return true;
    }

    // Get the user from the request
    const user: RequestUser = request.user;

    this.logger.debug(`Route: ${route}, Has user: ${!!user}, User role: ${user?.role}`);

    // If permissions are required but no user exists, skip for now
    // The JwtAuthGuard (applied at route level) will handle authentication
    // This guard will run again after JwtAuthGuard populates the user
    if (!user) {
      this.logger.debug(`Route: ${route} - skipping permission check, waiting for JwtAuthGuard`);
      return true;
    }

    // Parse metadata
    let requiredPermissions: Permission[];
    let requireAll = false;

    if (Array.isArray(permissionsMetadata)) {
      // Simple array of permissions (default behavior: require ANY)
      requiredPermissions = permissionsMetadata;
      requireAll = false;
    } else {
      // Object with permissions and requireAll flag
      requiredPermissions = permissionsMetadata.permissions;
      requireAll = permissionsMetadata.requireAll ?? false;
    }

    // Check permissions using database-driven service
    const hasAccess = requireAll
      ? await this.permissionsService.hasAllPermissions(user.role, requiredPermissions)
      : await this.permissionsService.hasAnyPermission(user.role, requiredPermissions);

    this.logger.log(
      `Permission check for user ${user.id} (${user.role}): Required=${requiredPermissions.join(', ')}, HasAccess=${hasAccess}`,
    );

    if (!hasAccess) {
      this.logger.warn(
        `User ${user.id} with role ${user.role} attempted to access resource requiring permissions: ${requiredPermissions.join(', ')}`,
      );
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
      );
    }

    this.logger.debug(
      `User ${user.id} with role ${user.role} granted access to resource`,
    );

    return true;
  }
}
