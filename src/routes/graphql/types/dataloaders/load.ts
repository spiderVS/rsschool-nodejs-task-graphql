import DataLoader = require("dataloader");
import { FastifyInstance } from "fastify";

export const createLoaders = async (fi: FastifyInstance) => {

  const batchGetPostsByUserId = async (ids: any) => {
    const posts = await fi.db.posts.findMany({ key: 'userId', equalsAnyOf: ids });
    return ids.map((id: string) => posts.filter((post) => post.userId === id));
  };

  return new DataLoader(batchGetPostsByUserId);
}
