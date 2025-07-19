import { DataSource } from 'typeorm';
import { AuthUser, UserRole } from '../src/auth/auth-user.entity';
import * as dotenv from 'dotenv';
import * as argon2 from 'argon2';

dotenv.config();

const hashPassword = async (plainPassword: string): Promise<string> => {
  return await argon2.hash(plainPassword, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  });
};

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_POSRT || '5432'),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [AuthUser],
  synchronize: true, // OK for seed/dev, not prod
});

async function seed() {
  await AppDataSource.initialize();
  const authUserRepo = AppDataSource.getRepository(AuthUser);
  await authUserRepo.clear();

  const usersPromises = Array.from({ length: 5 }, async (_, i) => {
    const username = `user${i + 1}`;
    const password = await hashPassword(`password${i + 1}`);
    const role = i === 0 ? UserRole.ADMIN : UserRole.USER;

    return authUserRepo.create({
      username,
      hashedPassword: password,
      role,
    });
  });

  const users = await Promise.all(usersPromises);

  await authUserRepo.save(users);

  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
