import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PropertyService } from '../../services/property';

@Component({
  selector: 'app-listing-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './listing-card.html',
  styleUrls: ['./listing-card.scss']
})
export class ListingCardComponent {
  //  @Input means: "I am waiting for my Parent to give me this data"
  @Input() listing: any; 
  isFavorite: boolean = false;

  constructor(
    private propertyService: PropertyService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // 🎓 Subscribe to the global list. 
    // Whenever the list changes (add/remove anywhere), this card checks itself.
    this.propertyService.favoriteIds$.subscribe(ids => {
      if (this.listing) {
        this.isFavorite = ids.includes(this.listing.id);
        this.cdr.detectChanges();
      }
    });
  }

  toggleFav(event: Event) {
   // event.stopPropagation(); // Prevent clicking the card (which goes to details)
    event.preventDefault();
    this.propertyService.toggleFavorite(this.listing.id);
  }
}