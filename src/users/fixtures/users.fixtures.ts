import { User } from '../user.entity';

export const usersFixtures: User[] = [
  {
    id: 1,
    email: 'test1@test.com',
    password: 'test',
    isActive: true,
  },
  {
    id: 1,
    email: 'test2@test.com',
    password: 'test',
    isActive: true,
  },
].map((fixture) => {
  const { id, email, password, isActive } = fixture;
  const userFixture = new User();
  userFixture.id = id;
  userFixture.email = email;
  userFixture.password = password;
  userFixture.isActive = isActive;
  return userFixture;
});
