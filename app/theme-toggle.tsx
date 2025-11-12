"use client";

import { useTheme } from "next-themes";

export function ThemeToggle(){
    const {theme, setTheme} = useTheme();
    return(
        <button
            onClick={()=> setTheme(theme === "light" ? "dark" : "light")}
        >
            theme toggle
        </button>
    )
}