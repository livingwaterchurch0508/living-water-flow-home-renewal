export interface SearchResult {
  id: string;
  name: string;
  url?: string;
  type?: string;
  desc?: string;
  nameEn?: string;
  descEn?: string;
  createdAt?: string;
  thumbnailUrl?: string;
  files?: { url: string; caption: string }[];
  fileUrl?: string;
  fileCaption?: string;
  viewCount?: number;
}

export interface SearchResponse {
  status: string;
  payload: {
    sermons: SearchResult[];
    hymns: SearchResult[];
    communities: SearchResult[];
  };
} 