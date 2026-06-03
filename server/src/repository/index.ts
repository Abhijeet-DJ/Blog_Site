import { IRepository } from './interface';
import { MongoRepository } from './mongo.repository';

// Add future adapters here:
// import { PostgresRepository } from './postgres.repository';
// import { RedisRepository } from './redis.repository';

let instance: IRepository | null = null;

export function getRepository(): IRepository {
  if (!instance) throw new Error('Repository not initialised — call initRepository() first');
  return instance;
}

export async function initRepository(): Promise<IRepository> {
  const driver = process.env.DB_DRIVER ?? 'mongodb';

  switch (driver) {
    case 'mongodb': {
      const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/daisyBlog";
      if (!uri) throw new Error('MONGODB_URI is required when DB_DRIVER=mongodb');
      instance = new MongoRepository(uri);
      break;
    }
    // case 'postgres': {
    //   instance = new PostgresRepository(process.env.POSTGRES_URI!);
    //   break;
    // }
    default:
      throw new Error(`Unknown DB_DRIVER "${driver}". Supported: mongodb`);
  }

  await instance.connect();
  return instance;
}
