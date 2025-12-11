import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable , BehaviorSubject } from 'rxjs';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private baseUrl = 'http://localhost:3000';

 

  //  Store the list of Favorite IDs (e.g., [1, 5, 12])
  private favoriteIdsSubject = new BehaviorSubject<number[]>([]);
  favoriteIds$ = this.favoriteIdsSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    // Keep favorites in sync with auth state: load on login, clear on logout
    this.authService.isLoggedIn$.subscribe((loggedIn) => {
      if (loggedIn) {
        this.loadFavorites();
      } else {
        this.favoriteIdsSubject.next([]);
      }
    });

    this.loadFavorites(); // Initial load (covers page refresh when already logged in)
  }

  // 1. Load favorites for logged-in user
  loadFavorites() {
    const user = this.authService.getUser();
    if (user && user.id) {
      this.http.get<any[]>(`${this.baseUrl}/favorites?userId=${user.id}`).subscribe({
        next: (data) => {
          const ids = data.map(item => item.listingId); // Extract just the IDs
          this.favoriteIdsSubject.next(ids);
        },
        error: (err) => {
          console.error('Error loading favorites:', err);
          this.favoriteIdsSubject.next([]);
        }
      });
    } else {
      this.favoriteIdsSubject.next([]); // Clear if no user
    }
  }

  // 2. Toggle Favorite (Add or Remove)
  toggleFavorite(listingId: number) {
    const user = this.authService.getUser();
    if (!user || !user.id) {
      alert('Please login to save favorites');
      return;
    }

    // Check if already favorite
    const currentFavorites = this.favoriteIdsSubject.value;
    const isFav = currentFavorites.includes(listingId);

    if (isFav) {
      // REMOVE: We first need to find the record ID to delete it
      this.http.get<any[]>(`${this.baseUrl}/favorites?userId=${user.id}&listingId=${listingId}`)
        .subscribe({
          next: (records) => {
            if (records.length > 0) {
              const favoriteRecordId = records[0].id;
              this.http.delete(`${this.baseUrl}/favorites/${favoriteRecordId}`).subscribe({
                next: () => {
                  // Update local state
                  const updated = currentFavorites.filter(id => id !== listingId);
                  this.favoriteIdsSubject.next(updated);
                  console.log('Favorite removed:', listingId);
                },
                error: (err) => console.error('Error removing favorite:', err)
              });
            }
          },
          error: (err) => console.error('Error fetching favorite record:', err)
        });
    } else {
      // ADD
      const newFav = { userId: user.id, listingId: listingId };
      this.http.post(`${this.baseUrl}/favorites`, newFav).subscribe({
        next: () => {
          // Update local state
          const updated = [...currentFavorites, listingId];
          this.favoriteIdsSubject.next(updated);
          console.log('Favorite added:', listingId);
        },
        error: (err) => console.error('Error adding favorite:', err)
      });
    }
  }


  // Get all apartments
  getAllListings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/listings`);
  }

  // Get single apartment by ID 
  getListingById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/listings/${id}`);
  }
   createListing(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/listings`, data);
  }

  // Get comments for a specific listing
  getComments(listingId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/comments?listingId=${listingId}`);
  }

  // Post a new comment
  postComment(comment: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/comments`, comment);
  }

}