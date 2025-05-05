// src/books/books.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
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
  async findManyByIds(id: string[]): Promise<Book[]> {
    const book = await this.bookModel
      .find({ _id: { $in: id }, deleted: false })
      .exec();
    return book;
  }

  async update(id: string, updateData: CreateBookDto): Promise<Book> {
    const updated = await this.bookModel
      .findOneAndUpdate({ _id: id, deleted: false }, updateData, { new: true })
      .exec();
    if (!updated) throw new NotFoundException(`Book with id ${id} not found`);
    return updated;
  }

  async markUnavailable(id: string[], session: ClientSession): Promise<Book[]> {
    const books = await this.bookModel
      .find({ _id: { $in: id }, deleted: false, availability: true })
      .session(session);
    if (books.length !== id.length) {
      const book = books.map((b) => b.title);
      throw new NotFoundException(`${book} is not found or unavailable`);
    }

    await this.bookModel.updateMany(
      { _id: { $in: id }, deleted: false, availability: true },
      { $set: { availability: false } },
      { session },
    );
    return books;
  }

  async markAvailable(id: string[], session: ClientSession): Promise<Book[]> {
    const update = await this.bookModel
      .find({ _id: { $in: id }, deleted: false, availability: false })
      .session(session);
    if (update.length !== id.length) {
      const upd = update.map((u) => u.title);
      throw new NotFoundException(
        `data ${upd} is damaged, contact our data provider`,
      );
    }
    await this.bookModel.updateMany(
      { _id: { $in: id }, deleted: false, availability: false },
      { $set: { availability: true } },
      { session },
    );
    return update;
  }

  async softDelete(id: string): Promise<Book> {
    const deleted = await this.bookModel
      .findByIdAndUpdate(id, { deleted: true }, { new: true })
      .exec();
    if (!deleted) throw new NotFoundException(`Book with id ${id} not found`);
    return deleted;
  }
}
