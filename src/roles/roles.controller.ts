import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { Permissions } from 'src/common/decorators/permissions.decorator';

@Permissions('role')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.rolesService.findAll(query.page, query.limit, query.search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: CreateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return this.rolesService.softDelete(id);
  }
}
