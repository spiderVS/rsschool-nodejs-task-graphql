import DBMemberTypes from './entities/DBMemberTypes';
import DBPosts from './entities/DBPosts';
import DBProfiles from './entities/DBProfiles';
import DBUsers from './entities/DBUsers';
import * as lodash from 'lodash';
// import { createFakeEntities } from '../db_init_helper/createFakeEntities';
export default class DB {
  users = new DBUsers();
  profiles = new DBProfiles();
  memberTypes = new DBMemberTypes();
  posts = new DBPosts();

  constructor() {

  //  createFakeEntities(this.users, this.posts, this.profiles, this.memberTypes);

    const deepCopyResultTrap: ProxyHandler<any> = {
      get: (target, prop) => {
        // console.log('DB request:', prop)
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
}
