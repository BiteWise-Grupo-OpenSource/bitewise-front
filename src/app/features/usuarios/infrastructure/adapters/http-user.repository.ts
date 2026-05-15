import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { User, CreateUserDto, UpdateUserDto } from '../../domain/entities';
import { UserRepositoryPort } from '../../domain/ports';

/**
 * HTTP adapter implementing UserRepositoryPort.
 * Communicates with json-server REST API.
 */
@Injectable({ providedIn: 'root' })
export class HttpUserRepository extends UserRepositoryPort {

  private readonly baseUrl = `${environment.apiUrl}/users`;

  constructor(private readonly http: HttpClient) {
    super();
  }

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  getByEmail(email: string): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl, { params: { email } });
  }

  create(dto: CreateUserDto): Observable<User> {
    const user: Omit<User, 'id'> = {
      ...dto,
      avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${dto.firstName[0]}${dto.lastName[0]}`,
      createdAt: new Date().toISOString()
    };
    return this.http.post<User>(this.baseUrl, user);
  }

  update(id: number, dto: UpdateUserDto): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
