export interface IMenuItem {
  id: string;
  _id: string;
  nameEn: string;
  nameJp: string;
  price: number;
  imageUrl: string;
  category?: string;
  isActive: boolean;
}
