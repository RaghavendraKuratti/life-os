import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const AuthGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.currentUser.pipe(
    map(user => {
      console.log("AuthGuard", user, router.url);
      if (user){
        return true;
      } else {
        router.navigateByUrl('/login');
        return false
      }
    })
  );
};
