import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common';
import { BorrowService } from './borrow.service';
import { CreateBorrowDto } from './dto/create-borrow.dto';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('borrow')
export class BorrowController {
  constructor(private readonly borrowService: BorrowService) {}

  @UseGuards(new RolesGuard(['admin']))
  @Post()
  create(@Body() createBorrowDto: CreateBorrowDto) {
    return this.borrowService.create(createBorrowDto);
  }

  @Get()
  async findAll(@Query() query: any) {
    return await this.borrowService.findAll(
      query.page,
      query.limit,
      query.search,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.borrowService.findOne(id);
  }

  @Patch(':id')
  markReturned(@Param('id') id: string) {
    return this.borrowService.markReturned(id);
  }
}
