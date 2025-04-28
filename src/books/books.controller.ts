// src/books/books.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @UseGuards(AuthGuard('jwt'), new RolesGuard(['admin']))
  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Get()
  async findAll(@Query() query: any) {
    const result = await this.booksService.findAll(
      query.page,
      query.limit,
      query.search,
    );

    return {
      ...result,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @UseGuards(new RolesGuard(['admin']))
  @Put(':id')
  update(@Param('id') id: string, @Body() updateData: CreateBookDto) {
    return this.booksService.update(id, updateData);
  }

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return this.booksService.softDelete(id);
  }
}
