export interface DateInterface {
  _id: string;
  id: number;
  title: string;
  notes: string;
  category: string;
  icon_path: string;
  image_path: string;
  done: boolean;
  date_realised: string | null;
  createdAt: string;
  updatedAt: string;
}