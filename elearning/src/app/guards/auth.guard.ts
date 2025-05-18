import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UtilityService } from '../services/utility.service';
import { CloudService } from '../services/cloud.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const utilityService = inject(UtilityService);
  const cloudService = inject(CloudService);
  
  // Check if token exists
  if (!utilityService.getToken()) {
    router.navigate(['/login']);
    return false;
  }
  
  return cloudService.isAuth().pipe(
    map((res: any) => {
      if (res.success && res.data) {
        const userRole = res.data.role;
        
        // Check route access based on role
        if (state.url.includes('/admin')) {
          // Admin routes - only accessible to admins (course creators)
          if (userRole === 'admin') {
            return true;
          } else {
            router.navigate(['/']);
            return false;
          }
        } else if (state.url.includes('/student')) {
          // Student routes - accessible to students and admins
          if (userRole === 'student' || userRole === 'admin') {
            return true;
          } else {
            router.navigate(['/']);
            return false;
          }
        } else if (state.url.includes('/course-content')) {
          // Course content routes - need to check enrollment
          // This would typically involve additional checks in a real app
          // For now, we'll allow students and admins
          if (userRole === 'student' || userRole === 'admin') {
            return true;
          } else {
            router.navigate(['/']);
            return false;
          }
        }
        
        // Other authenticated routes - accessible to all authenticated users
        return true;
      } else {
        // Invalid or expired token
        utilityService.removeToken();
        router.navigate(['/login']);
        return false;
      }
    }),
    catchError(() => {
      utilityService.removeToken();
      router.navigate(['/login']);
      return of(false);
    })
  );
};

// Guard specifically for student routes
export const studentGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const utilityService = inject(UtilityService);
  const cloudService = inject(CloudService);
  
  if (!utilityService.getToken()) {
    router.navigate(['/login']);
    return false;
  }
  
  return cloudService.isAuth().pipe(
    map((res: any) => {
      if (res.success && res.data) {
        if (res.data.role === 'student' || res.data.role === 'admin') {
          return true;
        } else {
          router.navigate(['/']);
          return false;
        }
      } else {
        utilityService.removeToken();
        router.navigate(['/login']);
        return false;
      }
    }),
    catchError(() => {
      utilityService.removeToken();
      router.navigate(['/login']);
      return of(false);
    })
  );
};

// Guard specifically for admin/instructor routes
export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const utilityService = inject(UtilityService);
  const cloudService = inject(CloudService);
  
  if (!utilityService.getToken()) {
    router.navigate(['/login']);
    return false;
  }
  
  return cloudService.isAuth().pipe(
    map((res: any) => {
      if (res.success && res.data && res.data.role === 'admin') {
        return true;
      } else {
        router.navigate(['/']);
        return false;
      }
    }),
    catchError(() => {
      utilityService.removeToken();
      router.navigate(['/login']);
      return of(false);
    })
  );
};

// Guard for guest preview routes (allows both authenticated and unauthenticated users)
export const previewGuard: CanActivateFn = (route, state) => {
  // Always allow access to preview routes
  return true;
};
