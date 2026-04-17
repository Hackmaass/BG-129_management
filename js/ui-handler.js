import { onAuthChange, logoutUser } from "./auth-logic.js";

document.addEventListener('DOMContentLoaded', () => {
    const authLinks = document.getElementById('auth-links');
    
    if (!authLinks) return;

    onAuthChange((user) => {
        if (user) {
            // User is signed in
            authLinks.innerHTML = `
                <a href="orders.html" class="nav-link" style="margin-right: 15px;" title="Order History"><i class="fas fa-box-open"></i></a>
                <a href="cart.html" class="nav-link" style="margin-right: 15px;" title="View Cart"><i class="fas fa-shopping-cart"></i></a>
                <span class="nav-link user-email" style="margin-right: 15px; color: var(--accent-color); font-weight: 500;">
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
                <a href="orders.html" class="nav-link" style="margin-right: 15px;" title="Order History"><i class="fas fa-box-open"></i></a>
                <a href="cart.html" class="nav-link" style="margin-right: 15px;" title="View Cart"><i class="fas fa-shopping-cart"></i></a>
                <a href="login.html" class="nav-link">Sign In</a>
                <a href="register.html" class="btn">Sign Up</a>
            `;
        }
    });
});
