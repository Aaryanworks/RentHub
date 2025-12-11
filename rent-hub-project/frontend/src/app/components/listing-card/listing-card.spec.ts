import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ListingCardComponent as ListingCard } from './listing-card';

describe('ListingCard', () => {
  let component: ListingCard;
  let fixture: ComponentFixture<ListingCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListingCard, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListingCard);
    component = fixture.componentInstance;
    component.listing = {
      id: 1,
      image: 'http://example.com/img.jpg',
      price: 1000,
      type: 'Apartment',
      title: 'Test Listing',
      location: 'Somewhere',
      amenities: ['Gym', 'Pool']
    };
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
