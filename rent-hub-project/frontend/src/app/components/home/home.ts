import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PropertyService } from '../../services/property';
import { ListingCardComponent } from '../listing-card/listing-card';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ListingCardComponent, FormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {
  listings: any[] = [];
  filteredListings: any[] = [];
  paginatedListings: any[] = []; // For displaying current page
  featuredListings: any[] = [];
  favoriteIds: number[] = []; // Store favorite IDs locally
  
  searchTerm: string = '';
  sortBy: string = 'newest'; // Default sort option
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalPages: number = 1;
  
  // Expose Math to template
  Math = Math;
  
  // Carousel Logic
  currentSlideIndex = 0;
  
  constructor(
    private propertyService: PropertyService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('HomeComponent initialized');
    
    // Subscribe to favorite changes - this will update whenever favorites change anywhere
    this.propertyService.favoriteIds$.subscribe(ids => {
      this.favoriteIds = ids;
      this.cdr.detectChanges(); // Update view when favorites change
    });
    
    this.loadData();
  }

  async loadData() {
    console.log('Loading data...');
    try {
      const data = await firstValueFrom(this.propertyService.getAllListings());
      console.log('Data loaded:', data);
      this.listings = data;
      this.filteredListings = [...data];
      this.featuredListings = data.slice(0, 5);
      
      this.applySorting(); // Apply default sorting
      this.updatePagination(); // Calculate pagination

      this.cdr.detectChanges(); // Ensure view updates after async data load
    }
    catch (err) { 
      console.error('Error loading listings:', err);
      this.listings = [];
      this.filteredListings = [];
      this.featuredListings = [];
      this.cdr.detectChanges(); // Ensure view updates on error
    }
  }

  filterListings() {
    if (!this.searchTerm) {
      this.filteredListings = this.listings;
    } else {
      const searchLower = this.searchTerm.toLowerCase();
      
      this.filteredListings = this.listings.filter(item => {
        // Search in location
        const matchLocation = item.location?.toLowerCase().includes(searchLower);
        
        // Search in title
        const matchTitle = item.title?.toLowerCase().includes(searchLower);
        
        // Search in amenities array
        const matchAmenities = item.amenities?.some((amenity: string) => 
          amenity.toLowerCase().includes(searchLower)
        );
        
        return matchLocation || matchTitle || matchAmenities;
      });
    }
    
    this.applySorting();
    this.currentPage = 1; // Reset to first page on new search
    this.updatePagination();
  }

  // Sorting function
  applySorting() {
    switch (this.sortBy) {
      case 'price-asc':
        this.filteredListings.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        this.filteredListings.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
  this.filteredListings.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;  // newest first
  });
  break;
      case 'title':
        this.filteredListings.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'type':
        this.filteredListings.sort((a, b) => a.type.localeCompare(b.type));
        break;
      default:
        break;
    }
  }

  // Handle sort change
  onSortChange() {
    this.applySorting();
    this.currentPage = 1; // Reset to first page
    this.updatePagination();
  }

  // Pagination functions
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredListings.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedListings = this.filteredListings.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
      window.scrollTo({ top: 500, behavior: 'smooth' });
    }
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  prevPage() {
    this.goToPage(this.currentPage - 1);
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // Carousel Controls
  nextSlide() {
    if (this.currentSlideIndex < this.featuredListings.length - 1) {
      this.currentSlideIndex++;
    } else {
      this.currentSlideIndex = 0; // Loop back to start
    }
  }

  prevSlide() {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
    } else {
      this.currentSlideIndex = this.featuredListings.length - 1; // Loop to end
    }
  }

  // Toggle favorite for featured listing
  toggleFeaturedFav() {
    const listing = this.featuredListings[this.currentSlideIndex];
    if (listing) {
      this.propertyService.toggleFavorite(listing.id);
    }
  }

  // Check if current featured listing is favorite
  isFeaturedFavorite(): boolean {
    const listing = this.featuredListings[this.currentSlideIndex];
    if (!listing) return false;
    return this.favoriteIds.includes(listing.id);
  }
}