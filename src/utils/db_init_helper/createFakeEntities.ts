import DBMemberTypes from '../DB/entities/DBMemberTypes';
import DBPosts from '../DB/entities/DBPosts';
import DBProfiles from '../DB/entities/DBProfiles';
import DBUsers from '../DB/entities/DBUsers';

import { faker } from '@faker-js/faker';

export const generate_createUserDTO = () => ({
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email(),
});

export const generate_createProfileDTO = (userId: string, memberTypeId: string) => ({
  userId,
  memberTypeId,
  avatar: faker.image.avatar(),
  sex: faker.name.sexType(),
  birthday: faker.date.birthdate().getTime(),
  country: faker.address.country(),
  street: faker.address.street(),
  city: faker.address.city(),
});

export const generate_createPostDTO = (userId: string) => ({
  userId,
  title: faker.lorem.sentence(),
  content: faker.lorem.sentences(5),
});

const NUM_USERS = 10;
const NUM_POSTS = 2;

export const createFakeEntities = async (
  usersDB: DBUsers,
  postsDB: DBPosts,
  profilesDB: DBProfiles,
  memberTypesDB: DBMemberTypes
) => {
  for (let i = 0; i < NUM_USERS; i++) {
    const user = await usersDB.create(generate_createUserDTO());
    console.log('🚀 User:', user);

    for (let i = 0; i < NUM_POSTS; i++) {
      await postsDB.create(generate_createPostDTO(user.id));
    }

    await profilesDB.create(generate_createProfileDTO(user.id, Math.random() < 0.5 ? 'basic' : 'business'));
  }
};
