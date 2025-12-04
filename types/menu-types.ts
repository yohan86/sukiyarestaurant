export interface IMenuItem {
    id:string;
    title:string;
    price:number;
    description:string;
    image:string;
    isAvailable:boolean;
    offers?:boolean;
    discount?:number;
}
