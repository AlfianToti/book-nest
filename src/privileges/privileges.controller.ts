import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Put,
} from '@nestjs/common';
import { PrivilegesService } from './privileges.service';
import { CreatePrivilegeDto } from './dto/create-privilege.dto';
import { Permissions } from 'src/common/decorators/permissions.decorator';

@Permissions('privilege')
@Controller('privileges')
export class PrivilegesController {
  constructor(private readonly privilegesService: PrivilegesService) {}

  @Post()
  create(@Body() createPrivilegeDto: CreatePrivilegeDto) {
    return this.privilegesService.create(createPrivilegeDto);
  }

  @Get()
  async findAll(@Query() query: any) {
    return await this.privilegesService.findAll(
      query.page,
      query.limit,
      query.search,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.privilegesService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updatePrivilegeDto: CreatePrivilegeDto,
  ) {
    return this.privilegesService.update(id, updatePrivilegeDto);
  }

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return this.privilegesService.softDelete(id);
  }
}
