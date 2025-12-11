import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PropertyService } from '../../services/property';
import { AuthService } from '../../services/auth';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-listing-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './listing-details.html',
  styleUrls: ['./listing-details.scss']
})
export class ListingDetailsComponent implements OnInit {
  listing: any = null;
  comments: any[] = [];
  newCommentText: string = '';
  isLoggedIn: boolean = false;
  currentUser: any = null;
  loading: boolean = true;
  error: string = '';
  isFavorite: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // 1. Check Login Status
    this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
      this.currentUser = this.authService.getUser();
      this.cdr.detectChanges();
    });

    this.propertyService.favoriteIds$.subscribe(ids => {
      if (this.listing) {
        this.isFavorite = ids.includes(this.listing.id);
        this.cdr.detectChanges();
      }
    });

    // 2. Get ID from URL (e.g. /details/5 -> id = 5)
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadListing(id);
    } else {
      this.error = 'No listing ID provided';
      this.loading = false;
    }
  }
  copyLink() {
  navigator.clipboard.writeText(window.location.href);
  alert("Link copied!");
  console.log("Current URL:", window.location.href);
}


  loadListing(id: string) {
    this.loading = true;
    this.propertyService.getListingById(id).subscribe({
      next: (data) => {
        this.listing = data;
        this.loading = false;
        // Check if this listing is in favorites
        this.propertyService.favoriteIds$.subscribe(ids => {
          this.isFavorite = ids.includes(data.id);
          this.cdr.detectChanges();
        });
        this.loadComments(data.id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading listing:', err);
        this.error = 'Failed to load property details. Make sure the backend server is running on http://localhost:3000';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadComments(listingId: number) {
    this.propertyService.getComments(listingId).subscribe(data => {
      this.comments = data;
      this.cdr.detectChanges();
    });
  }

  toggleFav() {
    if (this.listing) {
      this.propertyService.toggleFavorite(this.listing.id);
    }
  }

  addComment() {
    if (!this.newCommentText.trim()) return;

    const newComment = {
      listingId: this.listing.id,
      userId: this.currentUser.id,
      username: this.currentUser.name || 'User',
      text: this.newCommentText,
      date: new Date().toISOString(),
      replies: [] // Initialize empty replies array
    };

    this.propertyService.postComment(newComment).subscribe(savedComment => {
      this.comments.push(savedComment);
      this.newCommentText = ''; // Clear input
    });
  }
}