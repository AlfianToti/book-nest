// src/books/books.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';

@Permissions('book')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('cover', {
      storage: diskStorage({
        destination: './uploads/images',
        filename: (req, file, cb) => {
          const ext = extname(file.originalname);
          const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `book-${filename}${ext}`);
        },
      }),
      fileFilter(req, file, callback) {
        if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
          callback(null, true);
        } else {
          return callback(
            new BadRequestException('Only jpg,png,webp files are allowed'),
            false,
          );
        }
      },
    }),
  )
  async create(
    @Body() createBookDto: CreateBookDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const coverPath = file ? `/uploads/images/${file.filename}` : null;
    createBookDto.cover = coverPath;
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

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/images',
        filename: (req, file, cb) => {
          const ext = extname(file.originalname);
          const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `book-${filename}${ext}`);
        },
      }),
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateData: CreateBookDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const coverPath = file ? `/uploads/images/${file.filename}` : null;
    updateData.cover = coverPath;
    return this.booksService.update(id, updateData);
  }

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return this.booksService.softDelete(id);
  }
}
