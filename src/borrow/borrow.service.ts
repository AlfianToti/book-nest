import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBorrowDto } from './dto/create-borrow.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Borrow } from './schemas/borrow.schema';
import { Model } from 'mongoose';
import { BooksService } from 'src/books/books.service';
import { Connection } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationGateway } from 'src/notification/notification.gateway';

@Injectable()
export class BorrowService {
  constructor(
    @InjectModel(Borrow.name) private readonly borrowModel: Model<Borrow>,
    private bookService: BooksService,
    @InjectConnection() private readonly con: Connection,
    private notificationGate: NotificationGateway,
  ) {}
  async create(createBorrowDto: CreateBorrowDto): Promise<Borrow> {
    const session = await this.con.startSession();
    session.startTransaction();

    try {
      const book = await this.bookService.findManyByIds(createBorrowDto.books);
      const unavailableBooks = book.filter((book) => !book.availability);
      if (unavailableBooks.length > 0) {
        const unavBook = unavailableBooks.map((book) => book.title);
        throw new BadRequestException(`${unavBook} unavailable`);
      }

      if (
        new Date(createBorrowDto.returnDate) <=
        new Date(createBorrowDto.borrowDate)
      ) {
        throw new BadRequestException('Return Date must be after Borrow Date');
      }

      // await Promise.all([
      //
      // Ini perulangan :                                   createBorrowDto.books.map((id) =>
      // Ini Query yang diulang menjadi n+1 query problem :   this.bookService.markUnavailable(id, session)),
      //   this.borrowModel.create([createBorrowDto], { session }),
      // ]);

      // Ini penyelesaian n+1 query
      const [_, bookser] = await Promise.all([
        this.bookService.markUnavailable(createBorrowDto.books, session),
        this.borrowModel.create([createBorrowDto], { session }),
      ]);

      await session.commitTransaction();
      return bookser[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    search = '',
  ): Promise<{ data: Borrow[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const pipeline: any[] = [
      { $match: { deleted: false } },
      {
        $lookup: {
          from: 'books',
          localField: 'books',
          foreignField: '_id',
          as: 'books',
        },
      },
    ];

    if (search) {
      const isNumber = !isNaN(Number(search));
      pipeline.push({
        $match: {
          $or: [
            { borrowerName: { $regex: search, $options: 'i' } },
            { 'books.title': { $regex: search, $options: 'i' } },
            { 'books.author': { $regex: search, $options: 'i' } },
            ...(isNumber ? [{ 'books.year': Number(search) }] : []),
          ],
        },
      });
    }

    const totalPipeline = [...pipeline, { $count: 'total' }];
    const totalResult = await this.borrowModel.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    const data = await this.borrowModel.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: limit },
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const borrow = await this.borrowModel.findById(id).populate('books');
    if (!borrow) {
      throw new NotFoundException(`Borrow with id ${id} not found`);
    }
    return borrow;
  }

  async markReturned(id: string): Promise<Borrow> {
    const session = await this.con.startSession();
    session.startTransaction();

    try {
      const data = (await this.findOne(id)).books.map((a) => a.toString());
      const book = await this.bookService.findManyByIds(data);
      const availableBooks = book.filter((book) => book.availability);
      if (availableBooks.length > 0) {
        const avaBook = availableBooks.map((a) => a.title);
        throw new BadRequestException(
          `book ${avaBook} damaged, please contact data manager`,
        );
      }

      const [_, borrow] = await Promise.all([
        this.bookService.markAvailable(data, session),
        this.borrowModel.findByIdAndUpdate(
          id,
          { returned: true, returnDate: new Date() },
          { new: true },
        ),
      ]);

      await session.commitTransaction();
      return borrow;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  @Cron('*/5 * * * *')
  async checkNearReturnBook() {
    const today = new Date();
    const sevenDays = new Date().setDate(today.getDate() + 7);

    const datas = await this.borrowModel.find({
      returned: false,
      returnDate: {
        $gte: today,
        $lte: sevenDays,
      },
    });

    for (const data of datas) {
      const user = data.borrowerName;

      this.notificationGate.sendNotificationToAdmin({
        message: `${user} has returning book due soon`,
        returnDate: data.returnDate,
        borrowId: data._id,
      });
    }
  }
}
