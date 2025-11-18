// assets/features/theme-toggle.js
document.addEventListener('DOMContentLoaded', () => {
  const themeToggleButton = document.getElementById('theme-toggle-float-btn');
  const htmlElement = document.documentElement;

  if (!themeToggleButton) {
    // console.error('Floating theme toggle button not found.');
    return;
  }

  // Function to apply the theme
  const applyTheme = (theme) => {
    htmlElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  // Function to get the initial theme
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    // Default to dark theme if no theme is saved
    return 'dark';
  };

  // Set the initial theme when the script loads
  const initialTheme = getInitialTheme();
  applyTheme(initialTheme);

  // Add click event listener to the button
  themeToggleButton.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  });
});
