import DataLoader = require("dataloader");
import { FastifyInstance } from "fastify";

export const createLoaders = async (fi: FastifyInstance) => {

  const batchGetPostsByUserId = async (ids: any) => {
    const posts = await fi.db.posts.findMany({ key: 'userId', equalsAnyOf: ids });
    return ids.map((id: string) => posts.filter((post) => post.userId === id));
  };

  const batchGetProfilesByUserId = async (ids: any) => {
    const profiles = await fi.db.profiles.findMany({ key: 'userId', equalsAnyOf: ids });
    return ids.map((id: string) => profiles.find((profile) => profile.userId === id) ?? null);
  }

  const batchGetMemberTypesByUserId = async (ids: any) => {
    const memberTypes = await fi.db.memberTypes.findMany({ key: 'id', equalsAnyOf: ids });
    return ids.map((id: string) => memberTypes.find((mt) => mt.id === id) ?? null);
  }

  const postsDataloader = new DataLoader(batchGetPostsByUserId);
  const profilesDataloader = new DataLoader(batchGetProfilesByUserId);
  const memberTypesDataloader = new DataLoader(batchGetMemberTypesByUserId);

  return { postsDataloader, profilesDataloader, memberTypesDataloader };
}
