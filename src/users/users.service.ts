import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hash = await bcrypt.hash(createUserDto.password, 10);
    createUserDto.password = hash;
    const result = new this.userModel(createUserDto);
    return result.save();
  }

  async findAll(
    page = 1,
    limit = 10,
    search = '',
  ): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const filter: any = { isDeleted: false };

    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.userModel
        .find(filter)
        .populate({
          path: 'role',
          populate: {
            path: 'permissions',
            model: 'Privilege',
          },
        })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findByEmail(email: string): Promise<User> {
    return await this.userModel.findOne({ email }).exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel
      .findOne({ _id: id, deleted: false })
      .exec();
    if (!user) {
      throw new NotFoundException(`Users with id ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: CreateUserDto) {
    const updated = await this.userModel
      .findOneAndUpdate({ _id: id, deleted: false }, updateUserDto, {
        new: true,
      })
      .exec();
    if (!updated) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return updated;
  }

  async findUserWithRoleAndPermission(id: string): Promise<User | null> {
    return this.userModel.findById(id).populate({
      path: 'role',
      populate: {
        path: 'permissions',
        model: 'Privilege',
      },
    });
  }

  async softDelete(id: string): Promise<User> {
    const deleted = await this.userModel
      .findByIdAndUpdate(id, { deleted: true }, { new: true })
      .exec();
    if (!deleted) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return deleted;
  }
}
