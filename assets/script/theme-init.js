(function() {
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  try {
    var preferredTheme = localStorage.getItem('theme');
    if (preferredTheme) {
      setTheme(preferredTheme);
    } else {
      // Default to light theme if no preference is found
      setTheme('light');
    }
  } catch (e) {
    // localStorage might be disabled
    setTheme('light');
    // console.error("Could not access localStorage to set theme.", e);
  }
})();
