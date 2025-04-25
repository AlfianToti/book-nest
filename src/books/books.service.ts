// src/books/books.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book } from './schemas/book.schema';
import { CreateBookDto } from './dto/create-book.dto';

@Injectable()
export class BooksService {
  constructor(@InjectModel(Book.name) private bookModel: Model<Book>) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const createdBook = new this.bookModel(createBookDto);
    return createdBook.save();
  }

  async findAll(
    page = 1,
    limit = 10,
    search = '',
  ): Promise<{ data: Book[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const filter: any = { deleted: false };

    if (search && isNaN(Number(search))) {
      filter['$or'] = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    } else if (search) {
      filter['$or'] = [{ year: Number(search) }];
    }

    const books = await this.bookModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.bookModel.countDocuments(filter).exec();

    return { data: books, total, page, limit };
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.bookModel
      .findOne({ _id: id, deleted: false })
      .exec();
    if (!book) throw new NotFoundException(`Book with id ${id} not found`);
    return book;
  }

  async update(id: string, updateData: CreateBookDto): Promise<Book> {
    const updated = await this.bookModel
      .findOneAndUpdate({ _id: id, deleted: false }, updateData, { new: true })
      .exec();
    if (!updated) throw new NotFoundException(`Book with id ${id} not found`);
    return updated;
  }

  // async remove(id: string): Promise<Book> {
  //   const deleted = await this.bookModel.findByIdAndDelete(id).exec();
  //   if (!deleted) throw new NotFoundException(`Book with id ${id} not found`);
  //   return deleted;
  // }

  async softDelete(id: string): Promise<Book> {
    const deleted = await this.bookModel
      .findByIdAndUpdate(id, { deleted: true }, { new: true })
      .exec();
    if (!deleted) throw new NotFoundException(`Book with id ${id} not found`);
    return deleted;
  }
}
