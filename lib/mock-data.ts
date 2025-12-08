import { IMenuItem } from "@/types/menu-types";

export  const MockData:IMenuItem[] = [
    {
        id: "d001",
        title: "Kaiseki Ryori",
        price: 125,
        description: "A meticulously prepared multi-course Japanese dinner...",
        image: "/menus/kottu.jpg", 
        isAvailable:true,
        offers:true,
        discount:20,
    },
    {
        id: "d002",
        title: "Sushi Platter",
        price: 95,
        description: "Chef's selection of the finest seasonal fish...",
        image: "/menus/sushi.jpg",
        isAvailable:true,
        offers:false,
        discount:0,
    },
    {
        id: "d003",
        title: "Kaiseki Ryori 2",
        price: 175,
        description: "A meticulously prepared multi-course Japanese dinner...",
        image: "/menus/kottu.jpg", 
        isAvailable:true,
        offers:false,
        discount:0,
    },
    {
        id: "d004",
        title: "Sushi Platter 3",
        price: 105,
        description: "Chef's selection of the finest seasonal fish...",
        image: "/menus/sushi.jpg",
        isAvailable:true,
        offers:true,
        discount:40,
    },
] 