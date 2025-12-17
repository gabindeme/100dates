export interface DateInterface {
  _id: string;
  title: string;
  notes: string;
  category: string;
  images: string[];
  done: boolean;
  date_realised: string | null;
  createdAt: string;
  updatedAt: string;
}