import { Sun, Moon } from 'lucide-react'
import useTheme from '../hooks/useTheme'

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button onClick={toggleTheme} className="btn btn-ghost btn-sm" aria-label="Toggle theme">
      {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      {/* {theme === 'Light' ?  "🌙 Dark" : "☀️ Light"} */}
    </button>
  )
}


