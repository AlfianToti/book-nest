import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from './schemas/role.schema';
import { Model } from 'mongoose';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
  ) {}

  create(createRoleDto: CreateRoleDto) {
    return this.roleModel.create(createRoleDto);
  }

  async findAll(
    page = 1,
    limit = 10,
    search = '',
  ): Promise<{ data: Role[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const pipeline: any[] = [
      { $match: { isDeleted: false } },
      {
        $lookup: {
          from: 'privileges',
          localField: 'permissions',
          foreignField: '_id',
          as: 'permissions',
        },
      },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { 'permissions.name': { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    const totalPipeline = [...pipeline, { $count: 'total' }];
    const totalResult = await this.roleModel.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    const data = await this.roleModel.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: limit },
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const role = await this.roleModel.findById(id).populate('privileges');
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    return role;
  }

  async update(id: string, updateRoleDto: CreateRoleDto) {
    const updated = await this.roleModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, updateRoleDto, {
        new: true,
      })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    return updated;
  }

  async softDelete(id: string) {
    const deleted = await this.roleModel
      .findByIdAndUpdate(id, { isDeleted: true }, { new: true })
      .exec();
    if (!deleted) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    return deleted;
  }
}
