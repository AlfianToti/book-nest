import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePrivilegeDto } from './dto/create-privilege.dto';
import { UpdatePrivilegeDto } from './dto/update-privilege.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Privilege } from './schemas/privilege.schema';
import { Model } from 'mongoose';

@Injectable()
export class PrivilegesService {
  constructor(
    @InjectModel(Privilege.name) private privilageModel: Model<Privilege>,
  ) {}

  async create(createPrivilegeDto: CreatePrivilegeDto): Promise<Privilege> {
    const newPrivilege = new this.privilageModel(createPrivilegeDto);
    return newPrivilege.save();
  }

  async findAll(
    page = 1,
    limit = 10,
    search = '',
  ): Promise<{
    data: Privilege[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const filter: any = { isDeleted: false };

    if (search) {
      filter['$or'] = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const privileges = await this.privilageModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.privilageModel.countDocuments(filter).exec();

    return { data: privileges, total, page, limit };
  }

  async findOne(id: string): Promise<Privilege> {
    const privilege = await this.privilageModel
      .findOne({ _id: id, isDeleted: false })
      .exec();
    if (!privilege) {
      throw new NotFoundException(`Privilege with id ${id} not found`);
    }
    return privilege;
  }

  async update(
    id: string,
    updatePrivilegeDto: CreatePrivilegeDto,
  ): Promise<Privilege> {
    const updated = await this.privilageModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, updatePrivilegeDto, {
        new: true,
      })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Privilege with id ${id} not found`);
    }
    return updated;
  }

  async softDelete(id: string): Promise<Privilege> {
    const deleted = await this.privilageModel
      .findByIdAndUpdate(id, { isDeleted: true }, { new: true })
      .exec();

    if (!deleted) {
      throw new NotFoundException(`Privilege with id ${id} not found`);
    }

    return deleted;
  }
}
