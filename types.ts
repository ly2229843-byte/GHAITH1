export enum UserRole {
  CITIZEN = 'CITIZEN',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  phone: string;
  password?: string;
  fullName: string;
  role: UserRole;
  motherName?: string; // Only for citizens
  createdAt: string;
}

export enum RequestStatus {
  SENT = 'تم إرسال الطلب',
  OPENED = 'تم فتح الطلب',
  UNDER_REVIEW = 'قيد المراجعة',
  REJECTED = 'مرفوض',
  SUCCESS = 'تم بنجاح'
}

export enum RequestType {
  EDUCATION = 'طلبات تخص التربية',
  JOB = 'طلبات التعيين',
  LOAN = 'طلبات القروض',
  TRANSFER = 'طلبات النقل',
  OTHER = 'طلب آخر',
  COMPLAINT = 'تقديم شكوى'
}

export interface ServiceRequest {
  id: string;
  userId: string;
  applicantName: string;
  motherName: string;
  dob: string;
  residence: string;
  details: string;
  type: RequestType | string; // Allow custom types
  status: RequestStatus;
  attachments: string[]; // URLs or placeholders
  createdAt: string;
  updatedAt: string;
  notes?: string; // Admin notes
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  mediaType: 'image' | 'video' | 'none';
  mediaUrl?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
}