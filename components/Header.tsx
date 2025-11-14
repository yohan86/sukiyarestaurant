import { ThemeToggle } from "@/app/theme-toggle";
import Image from "next/image";

const Header = ()=> {
    return(
        <header className="flex fixed t-0 l-0 w-full h-[85px] bg-primary py-1 border-b-2 border-border-color shadow-sm">
            <div className="inner-wrapper flex-row justify-between">
                <div className="flex gap-3 items-center">
                    <div className="logo-wrapper">
                        <Image src="/logo.png" width={80} height={40} alt="Sukiya Restaurant"  />
             
                    </div>
                    <h1 className="text-2xl md:text-3xl text-[#ffdf93] font-bold leading-0">Sukiya Restaurant</h1>
                </div>
                <ThemeToggle />
            </div> 
        </header>
    )
}

export default Header;