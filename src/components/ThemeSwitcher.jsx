// import { useEffect, useState } from "react";

// export default function ThemeSwitcher() {
//   const [theme, setTheme] = useState(localStorage.getItem("theme") || "lightTheme");

//   useEffect(() => {
//     document.querySelector("html").setAttribute("data-theme", theme);
//     localStorage.setItem("theme", theme);
//   }, [theme]);

//   return (
//     <button
//       className="btn btn-secondary"
//       onClick={() => setTheme(theme === "lightTheme" ? "darkTheme" : "lightTheme")}
//     >
//       {theme === "lightTheme" ? "🌙 Dark" : "☀️ Light"}
//     </button>
//   );
// }

import { Sun, Moon } from 'lucide-react'
import useTheme from '../hooks/useTheme'

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button onClick={toggleTheme} className="btn btn-ghost btn-sm" aria-label="Toggle theme">
      {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
    </button>
  )
}


