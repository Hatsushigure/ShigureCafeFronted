export interface ReactionCount {
  type: string;
  count: number;
  reacted: boolean;
}

export interface Notice {
  id: number;
  title: string;
  content: string;
  pinned: boolean;
  authorUsername: string;
  createdAt: number;
  updatedAt: number;
}

export interface PaginatedNotices {
  content: Notice[];
  totalPages: number;
  totalElements: number;
  pageSize: number;
  pageNumber: number;
  timestamp: number;
}
