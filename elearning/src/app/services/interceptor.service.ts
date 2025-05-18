import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {

  constructor(private us:UtilityService) { }
intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  const token = this.us.getToken();
  const modifiedRequest = req.clone({
    setHeaders: {
      'Authorization':`${token}`
    },
  });
  return next.handle(modifiedRequest);
}
}
