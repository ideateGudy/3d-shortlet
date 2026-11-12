export function ThemeScript() {
  const code = `
    (function() {
      try {
        var saved = localStorage.getItem('shortlet_theme');
        var theme = 'dark';
        if (saved === 'light' || saved === 'dark') {
          theme = saved;
        } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
          theme = 'light';
        }
        var root = document.documentElement;
        if (theme === 'dark') {
          root.classList.add('dark');
          root.classList.remove('light');
        } else {
          root.classList.remove('dark');
          root.classList.add('light');
        }
      } catch (e) {}
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
