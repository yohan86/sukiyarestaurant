import { ThemeToggle } from "./theme-toggle";

export default function Home() {
  return (
    <div className="flex bg-background dark:bg-amber-300  transition-colors duration-300">
      <div>
        <h1>Hello!</h1>
        <p>Toggle theme to test</p>
      </div>
      <ThemeToggle />
    </div>
  );
}
