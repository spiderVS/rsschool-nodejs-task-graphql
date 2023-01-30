import DBMemberTypes from './entities/DBMemberTypes';
import DBPosts from './entities/DBPosts';
import DBProfiles from './entities/DBProfiles';
import DBUsers from './entities/DBUsers';
import * as lodash from 'lodash';

// import { faker } from '@faker-js/faker';

// export const generate_createUserDTO = () => ({
//   firstName: faker.name.firstName(),
//   lastName: faker.name.lastName(),
//   email: faker.internet.email(),
// });

// export const generate_createProfileDTO = (userId: string, memberTypeId: string) => ({
//   userId,
//   memberTypeId,
//   avatar: faker.image.avatar(),
//   sex: faker.name.sexType(),
//   birthday: faker.date.birthdate().getTime(),
//   country: faker.address.country(),
//   street: faker.address.street(),
//   city: faker.address.city(),
// });

// export const generate_createPostDTO = (userId: string) => ({
//   userId,
//   title: faker.lorem.sentence(),
//   content: faker.lorem.sentences(5),
// });


export default class DB {
  users = new DBUsers();
  profiles = new DBProfiles();
  memberTypes = new DBMemberTypes();
  posts = new DBPosts();

  constructor() {

    // this.createFakeEntities();

    const deepCopyResultTrap: ProxyHandler<any> = {
      get: (target, prop) => {
        if (typeof target[prop] === 'function') {
          return (...args: any[]) => {
            const result = target[prop](...args);
            if (result instanceof Promise) {
              return result.then((v) => lodash.cloneDeep(v));
            }
            return lodash.cloneDeep(result);
          };
        } else {
          return target[prop];
        }
      },
    };
    for (const [k, v] of Object.entries(this)) {
      this[k as keyof typeof this] = new Proxy(v, deepCopyResultTrap);
    }
  }

  // createFakeEntities = async () => {
  //   for (let i = 0; i < 2; i++) {
  //     const user = await this.users.create(
  //       generate_createUserDTO()
  //       );
  //       console.log('🚀 user:', user);

  //     const post = await this.posts.create(generate_createPostDTO(user.id));
  //     console.log('🚀 post:', post);

  //     const profile = await this.profiles.create(generate_createProfileDTO(user.id, Math.random() < 0.5 ? 'basic' : 'business'));
  //     console.log('🚀 profile:', profile);
  //   }
  // };
}
