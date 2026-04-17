import { onAuthChange, logoutUser } from "./auth-logic.js";

document.addEventListener('DOMContentLoaded', () => {
    const authLinks = document.getElementById('auth-links');
    
    // Theme Management
    const themeToggleBtn = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'dark';

    if (currentTheme === 'light') {
        document.body.classList.add('light-mode');
        if (themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }

    const toggleTheme = () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        
        // Update all toggle buttons (in case multiple exist or it was re-rendered)
        const allToggles = document.querySelectorAll('#theme-toggle');
        allToggles.forEach(btn => {
            btn.innerHTML = isLight ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
    };

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    if (!authLinks) return;

    const getThemeIcon = () => localStorage.getItem('theme') === 'light' ? 'fa-sun' : 'fa-moon';

    onAuthChange(async (user) => {
        if (user) {
            let role = 'user';
            try {
                const token = await user.getIdToken();
                const response = await fetch('/api/auth/sync', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const result = await response.json();
                if (result.status === 'success') {
                    role = result.data.role;
                }
            } catch (err) {
                console.error("Profile sync failed:", err);
            }

            // User is signed in
            authLinks.innerHTML = `
                <button id="theme-toggle" class="nav-link" style="background:none; border:none; cursor:pointer;" title="Toggle Theme"><i class="fas ${getThemeIcon()}"></i></button>
                ${role === 'admin' ? '<a href="admin.html" class="nav-link" style="color: var(--primary); font-weight: 700;"><i class="fas fa-user-shield"></i> Admin</a>' : ''}
                <a href="orders.html" class="nav-link" style="margin-right: 15px;" title="Order History"><i class="fas fa-box-open"></i></a>
                <a href="cart.html" class="nav-link" style="margin-right: 15px;" title="View Cart"><i class="fas fa-shopping-cart"></i></a>
                <span class="nav-link user-email" style="margin-right: 15px; color: var(--primary); font-weight: 500;">
                    <i class="fas fa-user-circle"></i> ${user.displayName || user.email.split('@')[0]}
                </span>
                <button id="logout-btn" class="btn btn-outline" style="padding: 6px 15px;">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            `;

            // Setup logout button
            document.getElementById('logout-btn').addEventListener('click', async () => {
                const response = await logoutUser();
                if (response.success) {
                    window.location.href = 'index.html';
                }
            });
        } else {
            // User is signed out
            authLinks.innerHTML = `
                <button id="theme-toggle" class="nav-link" style="background:none; border:none; cursor:pointer;" title="Toggle Theme"><i class="fas ${getThemeIcon()}"></i></button>
                <a href="orders.html" class="nav-link" style="margin-right: 15px;" title="Order History"><i class="fas fa-box-open"></i></a>
                <a href="cart.html" class="nav-link" style="margin-right: 15px;" title="View Cart"><i class="fas fa-shopping-cart"></i></a>
                <a href="login.html" class="nav-link">Sign In</a>
                <a href="register.html" class="btn">Sign Up</a>
            `;
        }

        
        // Re-attach theme toggle listener after innerHTML update
        const newThemeBtn = document.getElementById('theme-toggle');
        if (newThemeBtn) {
            newThemeBtn.addEventListener('click', toggleTheme);
        }
    });
});

