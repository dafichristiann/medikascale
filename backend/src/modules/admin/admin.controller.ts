import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import {
  CreateUserDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
  UpdateRolePermissionsDto,
} from './dto/admin.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('admin.kelola')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'Daftar semua pengguna dan rolenya' })
  async getUsers() {
    return this.adminService.findAllUsers();
  }

  @Post('users')
  @ApiOperation({ summary: 'Tambah pengguna baru' })
  async createUser(@Body() dto: CreateUserDto) {
    return this.adminService.createUser(dto);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Aktifkan / nonaktifkan pengguna' })
  async updateUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.adminService.updateUserStatus(id, dto.aktif, user?.id);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Ubah role pengguna' })
  async updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(id, dto);
  }

  @Get('roles')
  @ApiOperation({ summary: 'Daftar semua role dan permission matrix' })
  async getRoles() {
    return this.adminService.findAllRoles();
  }

  @Get('permissions')
  @ApiOperation({ summary: 'Daftar semua permission yang tersedia di sistem' })
  async getPermissions() {
    return this.adminService.findAllPermissions();
  }

  @Patch('roles/:id/permissions')
  @ApiOperation({ summary: 'Perbarui daftar permission yang dimiliki role' })
  async updateRolePermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRolePermissionsDto,
  ) {
    return this.adminService.updateRolePermissions(id, dto);
  }
}
