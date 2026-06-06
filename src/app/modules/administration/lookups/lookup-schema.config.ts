import { TableColumn } from '@shared/components/data-table/data-table.component';
import {
  LucideGlobe,
  LucideGraduationCap,
  LucideMapPin,
  LucideLayers,
  LucideStar,
  LucideLandmark,
  LucideBriefcase,
  LucideAlertCircle,
  LucideFileText,
  LucideScroll,
  LucideCalendarOff,
  LucideGavel,
  LucideAward,
  LucideCalendar
} from '@lucide/angular';

export interface LookupField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'checkbox' | 'select' | 'textarea' | 'date';
  required?: boolean;
  max?: number;
  optionsResource?: string;
  optionLabelKey?: string;
  disabledInEdit?: boolean;
}

export interface LookupConfig {
  key: string;
  label: string;
  description: string;
  icon: any;
  columns: TableColumn[];
  fields: LookupField[];
}

export const LOOKUP_CONFIGS: LookupConfig[] = [
  {
    key: 'countries',
    label: 'Countries',
    description: 'Manage countries and ISO codes for locations and address records.',
    icon: LucideGlobe,
    columns: [
      { key: 'country_name', label: 'Country Name', type: 'text' },
      { key: 'iso_code', label: 'ISO Code', type: 'text' },
      { key: 'is_active', label: 'Status' }
    ],
    fields: [
      { name: 'country_name', label: 'Country Name', type: 'text', required: true, max: 255 },
      { name: 'iso_code', label: 'ISO Code', type: 'text', required: true, max: 3 },
      { name: 'is_active', label: 'Is Active', type: 'checkbox' }
    ]
  },
  {
    key: 'education-levels',
    label: 'Education Levels',
    description: 'Configure educational ranks and sorting orders for applicant/employee profiles.',
    icon: LucideGraduationCap,
    columns: [
      { key: 'level_name', label: 'Level Name', type: 'text' },
      { key: 'sort_order', label: 'Sort Order', type: 'text' }
    ],
    fields: [
      { name: 'level_name', label: 'Level Name', type: 'text', required: true, max: 255 },
      { name: 'sort_order', label: 'Sort Order', type: 'number', required: true }
    ]
  },
  {
    key: 'locations',
    label: 'Locations',
    description: 'Configure geographical locations, district links, and parent hierarchies.',
    icon: LucideMapPin,
    columns: [
      { key: 'location_name', label: 'Location Name', type: 'text' },
      { key: 'is_active', label: 'Status' }
    ],
    fields: [
      { name: 'location_name', label: 'Location Name', type: 'text', required: true, max: 255 },
      { name: 'level_id', label: 'Location Level', type: 'select', required: true, optionsResource: 'location-levels', optionLabelKey: 'level_name' },
      { name: 'country_id', label: 'Country', type: 'select', required: true, optionsResource: 'countries', optionLabelKey: 'country_name' },
      { name: 'parent_id', label: 'Parent Location', type: 'select', optionsResource: 'locations', optionLabelKey: 'location_name' },
      { name: 'is_active', label: 'Is Active', type: 'checkbox' }
    ]
  },
  {
    key: 'location-levels',
    label: 'Location Levels',
    description: 'Define hierarchy levels (e.g. Province, City, District) for locations.',
    icon: LucideLayers,
    columns: [
      { key: 'level_name', label: 'Level Name', type: 'text' },
      { key: 'sort_order', label: 'Sort Order', type: 'text' }
    ],
    fields: [
      { name: 'id', label: 'Numeric ID', type: 'number', required: true, disabledInEdit: true },
      { name: 'level_name', label: 'Level Name', type: 'text', required: true, max: 255 },
      { name: 'sort_order', label: 'Sort Order', type: 'number', required: true },
      { name: 'parent_level_id', label: 'Parent Level', type: 'select', optionsResource: 'location-levels', optionLabelKey: 'level_name' }
    ]
  },
  {
    key: 'grades',
    label: 'Job Grades',
    description: 'Manage professional grades, employee ranking classes, and ranks.',
    icon: LucideStar,
    columns: [
      { key: 'grade_name', label: 'Grade Name', type: 'text' },
      { key: 'level', label: 'Rank Level', type: 'text' },
      { key: 'is_active', label: 'Status' }
    ],
    fields: [
      { name: 'grade_name', label: 'Grade Name', type: 'text', required: true, max: 255 },
      { name: 'level', label: 'Rank Level (Numeric)', type: 'number', required: true },
      { name: 'is_active', label: 'Is Active', type: 'checkbox' }
    ]
  },
  {
    key: 'institutions',
    label: 'Institutions',
    description: 'Define universities, colleges, and training bodies and their recognition status.',
    icon: LucideLandmark,
    columns: [
      { key: 'institution_name', label: 'Institution Name', type: 'text' },
      { key: 'is_recognised', label: 'Recognised' },
      { key: 'is_active', label: 'Status' }
    ],
    fields: [
      { name: 'institution_name', label: 'Institution Name', type: 'text', required: true, max: 255 },
      { name: 'country_id', label: 'Country', type: 'select', required: true, optionsResource: 'countries', optionLabelKey: 'country_name' },
      { name: 'is_recognised', label: 'Is Recognised', type: 'checkbox' },
      { name: 'is_active', label: 'Is Active', type: 'checkbox' }
    ]
  },
  {
    key: 'mdas',
    label: 'MDAs',
    description: 'Configure Ministries, Departments, and Agencies along with contact details.',
    icon: LucideBriefcase,
    columns: [
      { key: 'code', label: 'Code', type: 'text' },
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'type', label: 'Type', type: 'text' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' }
    ],
    fields: [
      { name: 'code', label: 'MDA Code', type: 'text', required: true, max: 50 },
      { name: 'name', label: 'MDA Name', type: 'text', required: true, max: 255 },
      { name: 'type', label: 'MDA Type', type: 'text', required: true, max: 50 },
      { name: 'parent_mda_id', label: 'Parent MDA', type: 'select', optionsResource: 'mdas', optionLabelKey: 'name' },
      { name: 'address', label: 'Address', type: 'textarea' },
      { name: 'phone', label: 'Phone Number', type: 'text', max: 50 },
      { name: 'email', label: 'Email Address', type: 'text', max: 100 }
    ]
  },
  {
    key: 'priorities',
    label: 'Priorities',
    description: 'Set service priorities, response SLA timelines, and badge colors.',
    icon: LucideAlertCircle,
    columns: [
      { key: 'priority_name', label: 'Priority Name', type: 'text' },
      { key: 'sla_days', label: 'SLA Days', type: 'text' },
      { key: 'color_code', label: 'Color' },
      { key: 'is_active', label: 'Status' }
    ],
    fields: [
      { name: 'priority_name', label: 'Priority Name', type: 'text', required: true, max: 255 },
      { name: 'sla_days', label: 'SLA Days (Response)', type: 'number', required: true },
      { name: 'color_code', label: 'HEX Color Code', type: 'text', max: 50 },
      { name: 'is_active', label: 'Is Active', type: 'checkbox' }
    ]
  },
  {
    key: 'document-types',
    label: 'Document Types',
    description: 'Manage acceptable document formats, file sizes, and restrictions.',
    icon: LucideFileText,
    columns: [
      { key: 'type_name', label: 'Type Name', type: 'text' },
      { key: 'allowed_mime_types', label: 'Allowed Formats', type: 'text' },
      { key: 'max_size_mb', label: 'Max Size (MB)', type: 'text' },
      { key: 'is_active', label: 'Status' }
    ],
    fields: [
      { name: 'type_name', label: 'Type Name', type: 'text', required: true, max: 255 },
      { name: 'allowed_mime_types', label: 'Allowed Mime Types (comma-separated)', type: 'text' },
      { name: 'max_size_mb', label: 'Maximum Size (MB)', type: 'number', required: true },
      { name: 'is_active', label: 'Is Active', type: 'checkbox' }
    ]
  },
  {
    key: 'contract-types',
    label: 'Contract Types',
    description: 'Define system employment contract categories and ZPPRA template flags.',
    icon: LucideScroll,
    columns: [
      { key: 'name', label: 'Type Name', type: 'text' },
      { key: 'code', label: 'Code', type: 'text' },
      { key: 'requires_zppra_template', label: 'ZPPRA Template' },
      { key: 'is_active', label: 'Status' }
    ],
    fields: [
      { name: 'name', label: 'Contract Type Name', type: 'text', required: true, max: 255 },
      { name: 'code', label: 'Type Code (Slug)', type: 'text', required: true, max: 50 },
      { name: 'requires_zppra_template', label: 'Requires ZPPRA Template', type: 'checkbox' },
      { name: 'is_active', label: 'Is Active', type: 'checkbox' }
    ]
  },
  {
    key: 'leave-types',
    label: 'Leave Types',
    description: 'Configure leave types, annual limits, and supporting attachment options.',
    icon: LucideCalendarOff,
    columns: [
      { key: 'type_name', label: 'Type Name', type: 'text' },
      { key: 'max_days_per_year', label: 'Max Days / Yr', type: 'text' },
      { key: 'requires_attachment', label: 'Attachment Required' },
      { key: 'is_active', label: 'Status' }
    ],
    fields: [
      { name: 'type_name', label: 'Leave Type Name', type: 'text', required: true, max: 255 },
      { name: 'max_days_per_year', label: 'Maximum Days Per Year', type: 'number', required: true },
      { name: 'requires_attachment', label: 'Requires Support Attachment', type: 'checkbox' },
      { name: 'is_active', label: 'Is Active', type: 'checkbox' }
    ]
  },
  {
    key: 'legal-specialisations',
    label: 'Legal Specs',
    description: 'Manage fields of legal specialisation, descriptions, and categories.',
    icon: LucideGavel,
    columns: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'is_active', label: 'Status' }
    ],
    fields: [
      { name: 'name', label: 'Specialisation Name', type: 'text', required: true, max: 255 },
      { name: 'description', label: 'Description/Notes', type: 'textarea' },
      { name: 'is_active', label: 'Is Active', type: 'checkbox' }
    ]
  },
  {
    key: 'accomplishment-types',
    label: 'Accomplishment Types',
    description: 'Define award levels, certifications, and linked structural accomplishments.',
    icon: LucideAward,
    columns: [
      { key: 'type_name', label: 'Type Name', type: 'text' },
      { key: 'entity_type', label: 'Entity Type', type: 'text' },
      { key: 'is_active', label: 'Status' }
    ],
    fields: [
      { name: 'type_name', label: 'Accomplishment Type Name', type: 'text', required: true, max: 255 },
      { name: 'entity_type', label: 'Associated Entity Type', type: 'text', required: true, max: 100 },
      { name: 'is_active', label: 'Is Active', type: 'checkbox' }
    ]
  },
  {
    key: 'holidays',
    label: 'Holidays',
    description: 'Configure calendar public holidays, exact dates, and annual recurrence.',
    icon: LucideCalendar,
    columns: [
      { key: 'name', label: 'Holiday Name', type: 'text' },
      { key: 'holiday_date', label: 'Date', type: 'date', format: 'mediumDate' },
      { key: 'is_recurring', label: 'Recurring' }
    ],
    fields: [
      { name: 'name', label: 'Holiday Name', type: 'text', required: true, max: 255 },
      { name: 'holiday_date', label: 'Holiday Date', type: 'date', required: true },
      { name: 'is_recurring', label: 'Is Annually Recurring', type: 'checkbox' }
    ]
  }
];
