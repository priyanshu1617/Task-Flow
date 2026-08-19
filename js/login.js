document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const errorMsg = document.getElementById('form-error');
  const togglePassword = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('password');

  // Toggle Password Visibility
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      // Toggle icon
      if (type === 'text') {
        togglePassword.classList.remove('ph-eye-slash');
        togglePassword.classList.add('ph-eye');
      } else {
        togglePassword.classList.remove('ph-eye');
        togglePassword.classList.add('ph-eye-slash');
      }
    });
  }

  // Handle Login
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const username = document.getElementById('username').value.trim();
      const password = passwordInput.value.trim();

      // Validate Credentials
      if (username === 'studywithpriyanshu' && password === 'studywithme12345') {
        // Success: Hide error and redirect
        errorMsg.style.display = 'none';
        
        // Set session token
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        
        window.location.replace('dashboard.html');
      } else {
        // Failure: Show error
        errorMsg.style.display = 'block';
        
        // Add a little shake animation to the form
        loginForm.style.animation = 'none';
        loginForm.offsetHeight; /* trigger reflow */
        loginForm.style.animation = 'shake 0.5s ease';
      }
    });
  }
});
