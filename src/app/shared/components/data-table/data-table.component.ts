import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { mergeClasses } from '@shared/utilities/utils';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { MatInput, MatFormField, MatLabel } from '@angular/material/input';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { SelectSearchComponent } from '../select-search/select-search.component';
import { NgxPermissionsModule } from 'ngx-permissions';
import { ActionMenuComponent } from "../action-menu/action-menu.component";
import { ActionMenuItem } from '../action-menu/action-menu';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'image';
  format?: string;
  generated?: (row: any, index: number) => any;
}

export interface HeaderAction {
  label: string;
  icon?: string;
  color?: string;
  hide?: boolean;
  permissions?: string[];
  onClick: () => void;
}

export interface TableFilter {
  key: string;
  label: string;
  type: 'select' | 'input';
  options?: { label: string; value: any }[];
  placeholder?: string;
  defaultValue?: any;
  fieldName?: string;
  searchType?: string;
  ignoreValue?: any;
  queryOperator?: 'AND' | 'OR';
  groupId?: number;
}

@Component({
  selector: 'app-data-table',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatTooltip,
    ReactiveFormsModule,
    MatInput,
    MatFormField,
    MatLabel,
    MatProgressBar,
    MatSelectModule,
    MatOptionModule,
    SelectSearchComponent,
    NgxPermissionsModule,
    ActionMenuComponent
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
})
export class DataTableComponent<T> implements AfterViewInit, OnChanges {
  @Input() data: T[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() hidePagination: boolean = false;
  @Input() filterableColumns: string[] = [];
  @Input() filters: TableFilter[] = [];
  @Input() loading: boolean = false;
  @Input() searchLabel: string = 'Search...';
  @Input() containerClass: string = '';
  @Input() columnTemplates: Record<string, TemplateRef<any>> = {};
  @Input() filterTemplate?: TemplateRef<any>;
  @Input() headerActions: HeaderAction[] = [];
  @Input() showHoverBg = false;
  @Input() searchClass = 'w-1/5!';
  @Input() showOuterCard = true;
  @Input() actionMenuItems: ActionMenuItem<T>[] = [];

  get classes() {
    return mergeClasses('rounded-md overflow-hidden border border-gray-300', this.containerClass);
  }

  get cardClass() {
    return mergeClasses(this.showOuterCard ? 'p-4 bg-white rounded-md shadow-sm' : '');
  }

  get rowClasses() {
    return mergeClasses(
      'animate-slide-up transition-all duration-300 ease-out hover:scale-[1.01] hover:z-50 hover:relative cursor-pointer hover:shadow-2xl',
      this.showHoverBg
        ? 'hover:bg-gray-500/5! hover:text-black! hover:ring-2 hover:ring-gray-300'
        : '',
    );
  }

  filterControl = new FormControl('');
  filterForm = new FormGroup({});

  @ContentChild('customActions', { static: false }) customActionsTpl?: TemplateRef<any>;
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  dataSource = new MatTableDataSource<T>([]);

  @Input() totalItems = 0;
  @Input() pageSize = 10;
  @Input() pageIndex = 0;
  @Input() pageSizeOptions = [10, 25, 50, 100];
  @Input() isBackendSearch = false;

  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() view = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() search = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<Record<string, any>>();

  get showView() {
    return this.view.observed;
  }
  get showEdit() {
    return this.edit.observed;
  }
  get showDelete() {
    return this.delete.observed;
  }

  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(debounceTime(500), distinctUntilChanged()).subscribe((value) => {
      if (this.isBackendSearch) {
        this.search.emit(value);
      } else {
        this.dataSource.filter = value.trim().toLowerCase();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.dataSource.data = this.data;
    }

    if (changes['filters'] && this.filters.length) {
      this.initFilterForm();
    }

    if (this.filterableColumns.length) {
      this.dataSource.filterPredicate = (data: T, filter: string) => {
        const lowerFilter = filter.trim().toLowerCase();
        return this.filterableColumns.some((key) => {
          const value = data[key as keyof T];
          return value?.toString().toLowerCase().includes(lowerFilter);
        });
      };
    }
  }

  initFilterForm() {
    const group: any = {};
    this.filters.forEach((filter) => {
      group[filter.key] = new FormControl(filter.defaultValue || null);
    });
    this.filterForm = new FormGroup(group);

    this.filterForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((values) => {
        this.filterChange.emit(values);
      });
  }

  ngAfterViewInit() {
    if (!this.hidePagination && !this.isBackendSearch && this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchSubject.next(filterValue);
  }

  get displayedColumns() {
    const colKeys = this.columns.map((c) => c.key);
    if (this.showView || this.showEdit || this.showDelete || this.customActionsTpl || this.actionMenuItems.length) {
      colKeys.push('actions');
    }
    return colKeys;
  }

  onPageChange(event: PageEvent) {
    this.pageChange.emit(event);
  }
}
