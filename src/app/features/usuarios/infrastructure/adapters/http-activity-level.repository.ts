import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ActivityLevel } from '../../domain/entities';
import { ActivityLevelRepositoryPort } from '../../domain/ports';

@Injectable({ providedIn: 'root' })
export class HttpActivityLevelRepository extends ActivityLevelRepositoryPort {

  private readonly baseUrl = `${environment.apiUrl}/activity-levels`;

  constructor(private readonly http: HttpClient) {
    super();
  }

  getAll(): Observable<ActivityLevel[]> {
    return this.http.get<ActivityLevel[]>(this.baseUrl);
  }

  getById(id: number): Observable<ActivityLevel> {
    return this.http.get<ActivityLevel>(`${this.baseUrl}/${id}`);
  }
}
