import { Component, OnInit, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Items } from '../../core/services/items';
import { Claims } from '../../core/services/claims';
import { Item, ClaimSuccess } from '../../core/models/item.model';
import { PageEnter } from '../../core/directives/page-enter';
import { Upload } from '../../core/services/upload';

@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PageEnter],
  templateUrl: './item-detail.html',
  styleUrl: './item-detail.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ItemDetail implements OnInit {
  item = signal<Item | null>(null);
  loading = signal<boolean>(true);
  submitting = signal<boolean>(false);
  submitError = signal<string | null>(null);
  claimResult = signal<ClaimSuccess | null>(null);
  photoUrl: string | null = null;
  photoPreview: string | null = null;
  uploadingPhoto = signal<boolean>(false);
  lightboxOpen = signal<boolean>(false);

  claimantName = '';
  claimantEmail = '';
  claimantPhone = '';
  message = '';

  constructor(
    private route: ActivatedRoute,
    private itemsService: Items,
    private claimsService: Claims,
    private uploadService: Upload
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.itemsService.getItem(id).subscribe({
      next: item => {
        this.item.set(item);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  submitClaim(): void {
    const currentItem = this.item();
    if (!currentItem) return;

    if (!this.claimantEmail.trim() && !this.claimantPhone.trim()) {
      this.submitError.set('At least one contact method (email or phone) is required.');
      return;
    }

    this.submitError.set(null);
    this.submitting.set(true);

    this.claimsService.submitClaim({
      itemId: currentItem.id,
      claimantName: this.claimantName,
      claimantEmail: this.claimantEmail,
      claimantPhone: this.claimantPhone || undefined,
      message: this.message,
      photoUrl: this.photoUrl || undefined
    }).subscribe({
      next: result => {
        this.claimResult.set(result);
        this.submitting.set(false);
      },
      error: err => {
        this.submitError.set(err.error?.message || 'Something went wrong. Please try again.');
        this.submitting.set(false);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.photoPreview = URL.createObjectURL(file);
    this.uploadingPhoto.set(true);

    this.uploadService.uploadImage(file).subscribe({
      next: result => {
        this.photoUrl = result.url;
        this.uploadingPhoto.set(false);
      },
      error: () => {
        this.uploadingPhoto.set(false);
        this.submitError.set('Photo upload failed. You can still submit without a photo.');
      }
    });
  }

  removePhoto(fileInput: HTMLInputElement): void {
    this.photoUrl = null;
    this.photoPreview = null;
    fileInput.value = '';
  }


}

