import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBorrowDto } from './dto/create-borrow.dto';
import { UpdateBorrowDto } from './dto/update-borrow.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Borrow } from './schemas/borrow.schema';
import { Model } from 'mongoose';

@Injectable()
export class BorrowService {
  constructor(
    @InjectModel(Borrow.name) private readonly borrowModel: Model<Borrow>,
  ) {}
  create(createBorrowDto: CreateBorrowDto) {
    return this.borrowModel.create(createBorrowDto);
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
          from: 'books', // nama collection book (harus lowercase plural)
          localField: 'book',
          foreignField: '_id',
          as: 'book',
        },
      },
      { $unwind: '$book' },
    ];

    if (search) {
      const isNumber = !isNaN(Number(search));
      pipeline.push({
        $match: {
          $or: [
            { borrowerName: { $regex: search, $options: 'i' } },
            { 'book.title': { $regex: search, $options: 'i' } },
            { 'book.author': { $regex: search, $options: 'i' } },
            ...(isNumber ? [{ 'book.year': Number(search) }] : []),
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
    const borrow = await this.borrowModel.findById(id).populate('book');
    if (!borrow) {
      throw new NotFoundException(`Borrow with id ${id} not found`);
    }
    return borrow;
  }

  async markReturned(id: string) {
    const borrow = await this.borrowModel.findByIdAndUpdate(
      id,
      { returned: true, returnDate: new Date() },
      { new: true },
    );
    if (!borrow) {
      throw new NotFoundException(`Borrow with id ${id} not found`);
    }
    return borrow;
  }

  // update(id: number, updateBorrowDto: UpdateBorrowDto) {
  //   return `This action updates a #${id} borrow`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} borrow`;
  // }
}
