import { Observable } from 'rxjs';
import { User, CreateUserDto, UpdateUserDto } from '../entities';

/**
 * Port (interface) for User repository operations.
 * Infrastructure adapters must implement this contract.
 */
export abstract class UserRepositoryPort {
  abstract getAll(): Observable<User[]>;
  abstract getById(id: number): Observable<User>;
  abstract getByEmail(email: string): Observable<User[]>;
  abstract create(dto: CreateUserDto): Observable<User>;
  abstract update(id: number, dto: UpdateUserDto): Observable<User>;
  abstract delete(id: number): Observable<void>;
}
