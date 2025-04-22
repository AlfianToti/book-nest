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
  async create(createBorrowDto: CreateBorrowDto) {
    return await this.borrowModel.create(createBorrowDto);
  }

  async findAll() {
    return await this.borrowModel
      .find()
      .populate({
        path: 'book',
        select: 'title author year',
      })
      .exec();
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
