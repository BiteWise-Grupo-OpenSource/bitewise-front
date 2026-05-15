/**
 * User entity — aggregate root for the Users bounded context.
 */
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  role: 'user' | 'nutritionist';
  createdAt: string;
}

export type CreateUserDto = Omit<User, 'id' | 'createdAt' | 'avatarUrl'>;

export type UpdateUserDto = Partial<Omit<User, 'id' | 'createdAt'>>;
