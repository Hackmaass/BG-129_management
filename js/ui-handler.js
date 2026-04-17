import { onAuthChange, logoutUser } from "./auth-logic.js";
import { listenToNotifications, markNotificationAsRead } from "./notifications.js";

document.addEventListener('DOMContentLoaded', () => {
    const authLinks = document.getElementById('auth-links');
    let notificationCleanup = null;
    
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
        if (notificationCleanup) {
            notificationCleanup();
            notificationCleanup = null;
        }

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
                <div class="notification-wrapper" style="position: relative; display: inline-block;">
                    <button id="notification-btn" class="nav-link" style="background:none; border:none; cursor:pointer; position: relative;">
                        <i class="fas fa-bell"></i>
                        <span id="notification-badge" class="badge" style="display: none; position: absolute; top: 0; right: 0; padding: 2px 5px; font-size: 10px; border-radius: 50%;">0</span>
                    </button>
                    <div id="notification-dropdown" class="glass" style="display: none; position: absolute; top: 100%; right: 0; width: 300px; max-height: 400px; overflow-y: auto; z-index: 1100; padding: 15px; margin-top: 10px; border-color: var(--primary-glow);">
                        <h4 style="margin-bottom: 15px; border-bottom: 1px solid var(--card-border); padding-bottom: 10px;">Alerts</h4>
                        <div id="notification-items" class="flex flex-col gap-3">
                            <p style="text-align: center; color: var(--text-dim); font-size: 0.85rem;">No new alerts.</p>
                        </div>
                        <a href="automation.html" style="display: block; text-align: center; margin-top: 15px; font-size: 0.8rem; color: var(--primary);">Manage Automations</a>
                    </div>
                </div>
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

            // Setup real-time notifications
            const notifyBtn = document.getElementById('notification-btn');
            const notifyDropdown = document.getElementById('notification-dropdown');
            const notifyBadge = document.getElementById('notification-badge');
            const notifyItemsList = document.getElementById('notification-items');

            notifyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                notifyDropdown.style.display = notifyDropdown.style.display === 'none' ? 'block' : 'none';
            });

            document.addEventListener('click', () => {
                if (notifyDropdown) notifyDropdown.style.display = 'none';
            });

            notifyDropdown.addEventListener('click', (e) => e.stopPropagation());

            notificationCleanup = listenToNotifications(user.uid, (notifications) => {
                if (notifications.length > 0) {
                    notifyBadge.style.display = 'block';
                    notifyBadge.innerText = notifications.length;
                    notifyItemsList.innerHTML = notifications.map(n => `
                        <div class="notification-item" style="font-size: 0.85rem; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.03); cursor: pointer;" onclick="handleNotificationClick('${n.id}', '${n.productId}')">
                            <div style="margin-bottom: 3px;">${n.message}</div>
                            <div style="font-size: 0.7rem; color: var(--text-dim);">${new Date(n.createdAt).toLocaleTimeString()}</div>
                        </div>
                    `).join('');
                } else {
                    notifyBadge.style.display = 'none';
                    notifyItemsList.innerHTML = '<p style="text-align: center; color: var(--text-dim); font-size: 0.85rem;">No new alerts.</p>';
                }
            });

            window.handleNotificationClick = async (nid, pid) => {
                const token = await user.getIdToken();
                await markNotificationAsRead(nid, token);
                if (pid) window.location.href = `product.html?id=${pid}`;
            };

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

        
        // Re-attach theme toggle listener after innerHTML update
        const newThemeBtn = document.getElementById('theme-toggle');
        if (newThemeBtn) {
            newThemeBtn.addEventListener('click', toggleTheme);
        }
    });
});

