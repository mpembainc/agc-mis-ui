import { Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { PaginationParams, PaginatedResult } from '@shared/types';
import { Observable, BehaviorSubject, Subject, debounceTime, distinctUntilChanged, tap, filter, merge, takeUntil, switchMap, catchError, of } from 'rxjs';
import { ScrollTrackerDirective } from "@shared/directives/scroll-tracker";
import { CommonModule } from '@angular/common';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'select-search',
  imports: [
    MatSelectModule,
    ReactiveFormsModule, 
    MatProgressSpinner, 
    ScrollTrackerDirective, 
    CommonModule,
    NgxMatSelectSearchModule
  ],
  templateUrl: './select-search.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectSearchComponent),
      multi: true
    }
  ]
})
export class SelectSearchComponent<T> implements OnInit, OnDestroy, ControlValueAccessor {
  // --- Inputs ---
  @Input() label: string = 'Select Option';
  @Input() showLabel = true;
  @Input() placeholder: string = 'Search...';
  @Input() subscriptSizing: 'fixed' | 'dynamic' = 'fixed';

  // Properties to display/bind (e.g., 'name' and 'id')
  @Input() displayMember: string = 'name';
  @Input() valueMember: string = 'reference';

  // THE CORE: The function that fetches data from API
  @Input() fetchFn!: (params: PaginationParams) => Observable<PaginatedResult<T>>;
  
  // MODE 2: Offline Static Array
  @Input() items: T[] = [];

  /**
   * Optional pre-hydrated selected item.
   * Useful when the selected value exists but isn't present in the first loaded page.
   */
  @Input() selectedItem: T | null = null;

  @Output() valueChange = new EventEmitter<any>();

  // --- State ---
  public options$ = new BehaviorSubject<T[]>([]);
  public loading = false;
  public searchCtrl = new FormControl('');

  private page = 1;
  private pageSize = 20;
  private totalItems = 0;
  private _onDestroy = new Subject<void>();
  private loadMore$ = new Subject<void>();
  private reload$ = new Subject<void>();

  // CVA Callbacks
  onChange: any = () => { };
  onTouched: any = () => { };

  // Internal Value
  value: any = undefined;
  private selectedOption: T | null = null;

  constructor() { }

  ngOnInit(): void {
    // 1. Setup Search Stream
    const search$ = this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => {
        this.page = 1; // Reset page on new search
        this.options$.next([]); // Clear current options
      })
    );

    // 2. Setup Load More Stream
    const loadMoreTrigger$ = this.loadMore$.pipe(
      filter(() => this.options$.value.length < this.totalItems) // Stop if all loaded
    );

    // 3. Merge and Execute (include reload$ so options load without opening the select)
    merge(search$, loadMoreTrigger$, this.reload$)
      .pipe(
        takeUntil(this._onDestroy),
        tap(() => this.loading = true),
        switchMap(() => {
          const params: PaginationParams = {
            page: this.page,
            pageSize: this.pageSize,
            search: this.searchCtrl.value || ''
          };

          // DECIDE: Online or Offline?
          return this.getData(params);
        })
      )
      .subscribe((result) => {
        this.loading = false;
        this.totalItems = result.total;
        if (this.page === 1) {
          let nextItems = result.items;

          // If parent provides a hydrated selected item and it matches current value,
          // ensure it's present so MatSelect can render the trigger label.
          if (this.selectedItem != null && this.value !== undefined && this.value !== null && this.value !== '') {
            const hintedValue = this.getValue(this.selectedItem as any);
            if (hintedValue === this.value) {
              this.selectedOption = this.selectedItem;
              const hasHint = nextItems.some((opt: any) => this.getValue(opt) === hintedValue);
              if (!hasHint) {
                nextItems = [this.selectedItem, ...nextItems];
              }
            }
          }

          // Preserve the selected option so the selected label remains visible
          // even if the refreshed page doesn't include it (common after selecting
          // from a filtered/search result).
          if (this.selectedOption != null) {
            const selectedValue = this.getValue(this.selectedOption as any);
            const hasSelected = nextItems.some((opt: any) => this.getValue(opt) === selectedValue);
            if (!hasSelected) {
              nextItems = [this.selectedOption, ...nextItems];
            }
          }

          this.options$.next(nextItems);

          // If the selected value exists in the refreshed options, cache it.
          this.ensureOptionForValue(this.value);
        } else {
          this.options$.next([...this.options$.value, ...result.items]);
        }
      });

    // Initial load so selected value is shown immediately
    this.reload$.next();
  }

  /**
   * The Unified Data Handler
   * It normalizes Offline data to look like Online data
   */
  private getData(params: PaginationParams): Observable<PaginatedResult<T>> {
    // CASE 1: Online (API)
    if (this.fetchFn) {
      return this.fetchFn(params).pipe(
        catchError(() => of({ items: [], total: 0 }))
      );
    }

    // CASE 2: Offline (Static Array)
    if (this.items && this.items.length > 0) {
      return this.handleOfflineData(params);
    }

    // CASE 3: No data provided
    return of({ items: [], total: 0 });
  }

  /**
   * Handles filtering and pagination in-memory
   */
  private handleOfflineData(params: PaginationParams): Observable<PaginatedResult<T>> {
    const searchLower = params.search.toLowerCase();

    // 1. Filter
    const filtered = this.items.filter(item => {
      // Use the displayMember to find the string to search against
      // You can cast 'item' to any to access dynamic property
      const val = (item as any)[this.displayMember];
      return val ? String(val).toLowerCase().includes(searchLower) : false;
    });

    // 2. Paginate (Slice)
    // Even though it's offline, we slice it so the DOM doesn't freeze with 5000 items
    const startIndex = (params.page - 1) * params.pageSize;
    const endIndex = startIndex + params.pageSize;

    // Note: For infinite scroll behavior, we usually just return the slice. 
    // However, our subscription logic appends data. 
    // So we just return the specific slice for "Page X".
    const pagedData = filtered.slice(startIndex, endIndex);

    // Return as Observable to match the API signature
    return of({
      items: pagedData,
      total: filtered.length
    });
  }

  // If the parent updates the static list dynamically, trigger a reload
  ngOnChanges(changes: SimpleChanges) {
    if (changes['items'] && !changes['items'].firstChange) {
      // Reset and trigger a reload
      this.page = 1;
      this.totalItems = 0;
      this.options$.next([]);
      this.reload$.next();
    }
  }

  // --- Infinite Scroll Handler ---
  // Called by the template when scrolling hits bottom
  onScrollToEnd() {
    if (!this.loading && this.options$.value.length < this.totalItems) {
      this.page++;
      this.loadMore$.next();
    }
  }

  // --- CVA Implementation ---
  writeValue(obj: any): void {
    this.value = obj;
    this.ensureOptionForValue(obj);
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onSelectionChange(event: any) {
    this.value = event.value;

    // Cache the selected option so it can be preserved across reloads
    // (e.g., when search term is cleared or list refreshes).
    const match = (this.options$.value || []).find((opt: any) => this.getValue(opt) === event.value);
    this.selectedOption = (match as T) ?? this.selectedOption;

    this.onChange(event.value);
    this.valueChange.emit(event.value);
  }

  private ensureOptionForValue(value: any) {
    if (value === undefined || value === null || value === '') return;

    // Prefer the hydrated selected item if it matches.
    if (this.selectedItem != null) {
      const hintedValue = this.getValue(this.selectedItem as any);
      if (hintedValue === value) {
        this.selectedOption = this.selectedItem;
        const current = this.options$.value || [];
        const hasHint = current.some((opt: any) => this.getValue(opt) === hintedValue);
        if (!hasHint) {
          this.options$.next([this.selectedItem, ...current]);
        }
        return;
      }
    }

    // If already in current options, cache it.
    const match = (this.options$.value || []).find((opt: any) => this.getValue(opt) === value);
    if (match) {
      this.selectedOption = match as T;
      return;
    }

    // Offline items: if present, inject the matching item.
    if (this.items && this.items.length > 0) {
      const offlineMatch = (this.items as any[]).find((opt) => this.getValue(opt) === value);
      if (offlineMatch) {
        this.selectedOption = offlineMatch as T;
        const current = this.options$.value || [];
        const has = current.some((opt: any) => this.getValue(opt) === value);
        if (!has) {
          this.options$.next([offlineMatch as T, ...current]);
        }
      }
    }
  }

  // Helper to get display property safely
  getDisplayValue(option: any): string {
    return option[this.displayMember];
  }

  getValue(option: any): any {
    return option[this.valueMember];
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
}
