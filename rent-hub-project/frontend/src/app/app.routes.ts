import { Routes } from '@angular/router';
import { HomeComponent} from './components/home/home';
import { LoginComponent } from './components/login/login';
import { SignupComponent } from './components/signup/signup';
import { CreatePostComponent } from './components/create-post/create-post';
import { ListingDetailsComponent } from './components/listing-details/listing-details';
import { authGuard } from './guards/auth-guard';
import { noAuthGuard } from './guards/no-auth-guard';

export const routes: Routes = [
  // Default route: Redirect empty URL to 'home'
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  
  // Public Routes
  { path: 'home', component: HomeComponent },
  
  // Auth Routes - Only accessible when NOT logged in
  { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [noAuthGuard] },
  
  // Protected Routes - Only accessible when logged in
  { path: 'create-post', component: CreatePostComponent, canActivate: [authGuard] },
  
  // Dynamic Route: ':id' changes based on which apartment you click
  { path: 'details/:id', component: ListingDetailsComponent },
  
  // Wildcard Route: If user types nonsense, go back home
  { path: '**', redirectTo: 'home' }
];