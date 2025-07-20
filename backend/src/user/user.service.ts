import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { err, ok, Result } from 'neverthrow';

type UpdateUserError =
  | Error
  | {
      message: string;
      type: 'UserNotFound';
    };

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @Inject(Logger) private readonly logger: LoggerService,
  ) {}

  async findAll(): Promise<Result<User[], Error>> {
    try {
      const users = (await this.userRepo.find()).toSorted(
        (a, b) => a.id - b.id,
      );
      return ok(users);
    } catch (error) {
      this.logger.error(error);
      return err(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Result<User, UpdateUserError>> {
    try {
      const user = await this.userRepo.findOne({
        where: { id },
        relations: ['authUser'],
      });

      if (!user) {
        return err({
          message: `User with ID ${id} not found`,
          type: 'UserNotFound',
        });
      }

      Object.assign(user, updateUserDto);

      const savedUser = await this.userRepo.save(user);
      return ok(savedUser);
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error('Unknown update error'),
      );
    }
  }
}
