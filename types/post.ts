export interface Post {
  _id: string;
  content: string;
  userId: string;
  location: string | null;
  isAIApproved: boolean;
  createdAt: string;
  updatedAt: string;
} 