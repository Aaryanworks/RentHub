import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, BehaviorSubject } from 'rxjs';

import { HomeComponent as Home} from './home';
import { PropertyService } from '../../services/property';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let favoriteIds$: BehaviorSubject<number[]>;
  let propertyServiceMock: any;

  beforeEach(async () => {
    favoriteIds$ = new BehaviorSubject<number[]>([]);
    propertyServiceMock = {
      favoriteIds$: favoriteIds$,
      getAllListings: () => of([]),
      toggleFavorite: () => {}
    };

    await TestBed.configureTestingModule({
      imports: [Home, RouterTestingModule.withRoutes([])],
      providers: [
        { provide: PropertyService, useValue: propertyServiceMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
