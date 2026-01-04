import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const loginGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);
  
    if (auth.isAuthenticated()) {
      router.navigate(['/home']);
      return false;
    }
  
    return true;
};
  