import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2 rounded-lg border transition-all flex items-center justify-center cursor-pointer"
      style={{
        background: theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.06)',
        borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.12)',
        color: theme === 'dark' ? 'var(--solar-amber)' : 'var(--comet-violet)',
      }}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
    </button>
  );
}
