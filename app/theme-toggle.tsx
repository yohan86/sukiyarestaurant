"use client";

import { useTheme } from "next-themes";
import { FaMoon, FaSun } from "react-icons/fa";

export function ThemeToggle(){
    const {theme, setTheme} = useTheme();
    return(
        <div className="flex h-[30px] rounded-full mr-3 md:mr-6">
            <button
            onClick={()=> setTheme(theme === "light" ? "dark" : "light")}
            >
            <FaSun className="absolute h-6 w-6 rotate-0 scale-100 dark:-rotate-90 dark:scale-0"></FaSun>
            <FaMoon className="absolute h-6 w-6 rotate-90 scale-0 dark:-rotate-0 dark:scale-100"></FaMoon>
            </button>
        </div>
        
    )
}