import { Component, OnInit, signal, CUSTOM_ELEMENTS_SCHEMA, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Items } from '../../core/services/items';
import { Categories } from '../../core/services/categories';
import { Upload } from '../../core/services/upload';
import { Auth } from '../../core/services/auth';
import { Category } from '../../core/models/item.model';
import { PageEnter } from '../../core/directives/page-enter';

@Component({
  selector: 'app-report-item',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PageEnter],
  templateUrl: './report-item.html',
  styleUrl: './report-item.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ReportItem implements OnInit {
  categories = signal<Category[]>([]);
  submitting = signal<boolean>(false);
  uploading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  categoryDropdownOpen = signal<boolean>(false);

  itemType: 'Lost' | 'Found' = 'Lost';
  title = '';
  categoryId: number | null = null;
  location = '';
  description = '';
  photoUrl: string | null = null;
  photoPreview: string | null = null;

  constructor(
    private itemsService: Items,
    private categoriesService: Categories,
    private uploadService: Upload,
    private router: Router,
    private route: ActivatedRoute,
    public auth: Auth
  ) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const typeParam = params.get('type');
      if (typeParam === 'Lost' || typeParam === 'Found') {
        this.itemType = typeParam;
      }
    });

    this.categoriesService.getCategories().subscribe({
      next: cats => this.categories.set(cats),
      error: err => console.error('Failed to load categories', err)
    });
  }

  setItemType(type: 'Lost' | 'Found'): void {
    this.itemType = type;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.photoPreview = URL.createObjectURL(file);
    this.uploading.set(true);
    this.errorMessage.set(null);

    this.uploadService.uploadImage(file).subscribe({
      next: result => {
        this.photoUrl = result.url;
        this.uploading.set(false);
      },
      error: () => {
        this.errorMessage.set('Photo upload failed. You can still submit without a photo.');
        this.uploading.set(false);
      }
    });
  }

  removePhoto(fileInput: HTMLInputElement): void {
    this.photoUrl = null;
    this.photoPreview = null;
    fileInput.value = '';
  }


  submit(): void {
    if (!this.title.trim() || !this.description.trim() || !this.location.trim() || !this.categoryId) {
      this.errorMessage.set('Please fill in all required fields.');
      return;
    }

    this.errorMessage.set(null);
    this.submitting.set(true);

    this.itemsService.createItem({
      title: this.title,
      description: this.description,
      categoryId: this.categoryId,
      location: this.location,
      itemType: this.itemType,
      photoUrl: this.photoUrl ?? undefined
    }).subscribe({
      next: result => {
        this.submitting.set(false);
        this.router.navigate(['/items', result.itemId]);
      },
      error: err => {
        this.errorMessage.set(err.error?.message || 'Something went wrong. Please try again.');
        this.submitting.set(false);
      }
    });
  }

  get selectedCategoryName(): string {
    const cat = this.categories().find(c => c.id === this.categoryId);
    return cat ? cat.name : 'Select category';
  }

  toggleCategoryDropdown(): void {
    this.categoryDropdownOpen.set(!this.categoryDropdownOpen());
  }

  selectCategory(cat: Category): void {
    this.categoryId = cat.id;
    this.categoryDropdownOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.category-dropdown-wrapper')) {
      this.categoryDropdownOpen.set(false);
    }
  }
}