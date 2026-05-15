import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Goal } from '../../domain/entities';
import { GoalRepositoryPort } from '../../domain/ports';

@Injectable({ providedIn: 'root' })
export class HttpGoalRepository extends GoalRepositoryPort {

  private readonly baseUrl = `${environment.apiUrl}/goals`;

  constructor(private readonly http: HttpClient) {
    super();
  }

  getAll(): Observable<Goal[]> {
    return this.http.get<Goal[]>(this.baseUrl);
  }

  getById(id: number): Observable<Goal> {
    return this.http.get<Goal>(`${this.baseUrl}/${id}`);
  }
}
