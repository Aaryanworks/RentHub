import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { PropertyService } from '../../services/property';
import { AuthService } from '../../services/auth';
import { HttpClient } from '@angular/common/http';

//  Custom Validator Function


@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-post.html',
  styleUrls: ['./create-post.scss']
})
export class CreatePostComponent {
  postForm: FormGroup;
  showPreview: boolean = false;
  imagePreview: string = ''; // For showing uploaded image preview
  uploadedImageUrl: string = ''; // Store the backend URL
  isUploading: boolean = false; // Loading state for upload
  
  amenityOptions = [
    { name: 'Gym & Fitness', value: 'Gym', icon: 'fitness_center' },
    { name: 'Swimming Pool', value: 'Swimming Pool', icon: 'pool' },
    { name: 'Parking Spot', value: 'Parking', icon: 'local_parking' },
    { name: 'Power Backup', value: 'Power Backup', icon: 'bolt' },
    { name: 'Security', value: 'Security', icon: 'security' },
    { name: 'Laundry', value: 'Laundry', icon: 'local_laundry_service' },
    { name: 'WiFi / Internet', value: 'WiFi', icon: 'wifi' },
    { name: 'Elevator', value: 'Elevator', icon: 'elevator' },
    { name: 'Air Conditioning', value: 'AC', icon: 'ac_unit' }
  ];

  constructor(
    private fb: FormBuilder,
    private propertyService: PropertyService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {
    this.postForm = this.fb.group({
      //  Applied Custom Validator here
      title: ['', [Validators.required, Validators.minLength(5)]], 
      description: ['', [Validators.required, Validators.minLength(10)]],
      location: ['', Validators.required],
      state: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      price: [null, [Validators.required, Validators.min(1)]],
      type: ['Apartment', Validators.required],
      furnished: ['No', Validators.required], 
      vegetarian: ['No', Validators.required], 
      image: ['', Validators.required], // Will store Base64 or URL
      amenities: this.fb.array([]) 
    });
  }

  // Handle Image Upload - Upload to Backend
  onImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
        alert('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Upload to backend
      this.uploadImageToBackend(file);
    }
  }

  // Upload image to backend server
  uploadImageToBackend(file: File) {
    this.isUploading = true;
    
    const formData = new FormData();
    formData.append('image', file);

    this.http.post<any>('http://localhost:3000/upload', formData).subscribe({
      next: (response) => {
        console.log('Upload successful:', response);
        this.uploadedImageUrl = response.url;
        this.imagePreview = response.url;
        this.postForm.patchValue({ image: response.url });
        this.isUploading = false;
      },
      error: (error) => {
        console.error('Upload failed:', error);
        alert('Failed to upload image. Please try again.');
        this.isUploading = false;
      }
    });
  }

  // Remove uploaded image
  removeImage() {
    this.imagePreview = '';
    this.uploadedImageUrl = '';
    this.postForm.patchValue({ image: '' });
  }

  // Checkbox Logic
  onCheckboxChange(e: any) {
    const amenities: FormArray = this.postForm.get('amenities') as FormArray;
    if (e.target.checked) {
      amenities.push(new FormControl(e.target.value));
    } else {
      let i: number = 0;
      amenities.controls.forEach((item: any) => {
        if (item.value == e.target.value) {
          amenities.removeAt(i);
          return;
        }
        i++;
      });
    }
  }

  // Helper to check if amenity is selected (for styling)
  isAmenitySelected(value: string): boolean {
    const amenities = this.postForm.get('amenities') as FormArray;
    console.log(amenities.value);
    return amenities.value.includes(value);
  }

  togglePreview() {
    if (this.postForm.valid) {
      this.showPreview = !this.showPreview;
      window.scrollTo(0,0);
    } else {
      this.postForm.markAllAsTouched();
      // Scroll to error
      const firstInvalid = document.querySelector('.ng-invalid');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  onSubmit() {
    if (this.postForm.valid) {
      const user = this.authService.getUser();
      
      // Combine location, state, and pincode into a full location string
      const formValue = this.postForm.value;
      const fullLocation = `${formValue.location}, ${formValue.state} - ${formValue.pincode}`;
      
      const newListing = {
        ...formValue,
        location: fullLocation, // Store combined location
        hostId: user.id || 1,
        id: Math.floor(Math.random() * 10000),
        createdAt: new Date().toISOString()
      };
      
      // Remove separate state and pincode fields (optional, for cleaner data)
      delete newListing.state;
      delete newListing.pincode;

      this.propertyService.createListing(newListing).subscribe({
        next: () => {
          this.router.navigate(['/home']);
        },
        error: (err) => console.error(err)
      });
    }
  }
}