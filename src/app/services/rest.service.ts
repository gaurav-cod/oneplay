import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, catchError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoginDTO, SignupDTO } from '../interface';
import { UserModel } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RestService {
  private readonly api = environment.api_endpoint;
  private readonly idam_api = environment.idam_api_endpoint;

  constructor(private readonly http: HttpClient, private readonly authService: AuthService) {
  }

  login(data: LoginDTO): Observable<void> {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    return this.http
      .post(this.idam_api + '/user/login', formData)
      .pipe(
        map(res => {
          this.authService.login(res["data"]);
        }),
        catchError((res) => {
          throw new Error(res.error["error_msg"]);
        })
      );
  }

  signup(data: SignupDTO): Observable<void> {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("password", data.password);
    return this.http
      .post(this.idam_api + '/user/signup', formData)
      .pipe(
        map(() => { }),
        catchError((res) => {
          throw new Error(res.error["error_msg"]);
        })
      );
  }

  verify(token: string): Observable<void> {
    const formData = new FormData();
    formData.append("verify_token", token);
    return this.http
      .post(this.idam_api + '/user/verify_user', formData)
      .pipe(
        map(res => { }),
        catchError((res) => {
          throw new Error(res.error["error_msg"]);
        })
      );
  }

  requestResetPassword(email: string): Observable<void> {
    const formData = new FormData();
    formData.append("email", email);
    return this.http
      .post(this.idam_api + '/user/request_password_reset', formData)
      .pipe(
        map(res => { }),
        catchError((res) => {
          throw new Error(res.error["error_msg"]);
        })
      );
  }

  resetPassword(token: string, password: string): Observable<void> {
    const formData = new FormData();
    formData.append("reset_token", token);
    formData.append("password", password);
    return this.http
      .post(this.idam_api + '/user/reset_password', formData)
      .pipe(
        map(res => { }),
        catchError((res) => {
          throw new Error(res.error["error_msg"]);
        })
      );
  }
}
