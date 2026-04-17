import { auth } from './auth-logic.js';

const API_BASE_URL = '/api';

const request = async (path, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    if (auth && auth.currentUser) {
        const token = await auth.currentUser.getIdToken(true);
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    });

    const data = await response.json();
    if (!response.ok) {
        if (response.status === 403) {
            alert("Forbidden: Admin access only.");
            window.location.href = 'index.html';
        }
        throw new Error(data.message || 'Request failed');
    }
    return data;
};

const formatPrice = (value) => `$${Number(value).toFixed(2)}`;

const initDashboard = async () => {
    // Tab Switching
    const tabs = document.querySelectorAll('[data-tab]');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.querySelectorAll('.tab-pane').forEach(p => p.style.display = 'none');
            document.getElementById(`tab-${tab.dataset.tab}`).style.display = 'block';
            
            loadTabData(tab.dataset.tab);
        });
    });

    // Default Load
    loadTabData('products');
};

const loadTabData = async (tab) => {
    switch (tab) {
        case 'products':
            await loadAdminProducts();
            break;
        case 'orders':
            await loadAdminOrders();
            break;
        case 'users':
            await loadAdminUsers();
            break;
    }
};

const loadAdminProducts = async () => {
    const grid = document.getElementById('admin-product-grid');
    if (!grid) return;

    try {
        const response = await request('/products');
        const products = response.data || [];
        
        grid.innerHTML = products.map(p => `
            <div class="glass product-card" style="padding: 15px;">
                <img src="${p.image}" alt="${p.title}" style="width: 100%; border-radius: 8px; margin-bottom: 10px;">
                <h4 style="font-size: 0.95rem; margin-bottom: 5px;">${p.title}</h4>
                <div class="flex justify-between items-center" style="font-size: 0.85rem;">
                    <span>Price: ${formatPrice(p.price)}</span>
                    <span style="color: ${p.inventory < 5 ? '#ff6b6b' : 'var(--text-muted)'};">Stock: ${p.inventory}</span>
                </div>
                <div class="flex gap-2 mt-4">
                    <button class="btn btn-outline" style="flex: 1; padding: 5px;" onclick="editProduct('${p.id}')">Edit</button>
                    <button class="btn btn-danger" style="flex: 1; padding: 5px;" onclick="deleteProduct('${p.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error(error);
    }
};

const loadAdminOrders = async () => {
    const list = document.getElementById('admin-orders-list');
    if (!list) return;

    try {
        const response = await request('/admin/orders');
        const orders = response.data || [];
        
        list.innerHTML = orders.map(o => `
            <tr>
                <td style="font-family: monospace; font-size: 0.8rem;">${o.orderId.slice(0, 8)}...</td>
                <td style="font-size: 0.85rem;">${o.userId}</td>
                <td style="color: var(--primary);">${formatPrice(o.total)}</td>
                <td><span class="status-badge">${o.status}</span></td>
                <td>
                    <select onchange="updateStatus('${o.orderId}', this.value)" style="background: rgba(255,255,255,0.05); color: white; border: 1px solid var(--card-border); border-radius: 4px; padding: 4px;">
                        <option value="placed" ${o.status === 'placed' ? 'selected' : ''}>Placed</option>
                        <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error(error);
    }
};

const loadAdminUsers = async () => {
    const list = document.getElementById('admin-users-list');
    if (!list) return;

    try {
        const response = await request('/admin/users');
        const users = response.data || [];
        
        list.innerHTML = users.map(u => `
            <div class="glass flex justify-between items-center" style="padding: 15px 25px;">
                <div>
                    <div style="font-weight: 700;">${u.name || 'Developer'}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${u.email}</div>
                </div>
                <div class="flex items-center gap-4">
                    <span class="badge">${u.role}</span>
                    <button class="btn btn-outline" style="padding: 5px 15px; font-size: 0.8rem;" onclick="toggleRole('${u.uid}', '${u.role}')">
                        Change Role
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error(error);
    }
};

window.updateStatus = async (orderId, status) => {
    try {
        await request(`/admin/orders/${orderId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
        alert('Order updated.');
    } catch (error) {
        alert(error.message);
    }
};

window.deleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    try {
        await request(`/admin/products/${id}`, { method: 'DELETE' });
        loadAdminProducts();
    } catch (error) {
        alert(error.message);
    }
};

document.addEventListener('DOMContentLoaded', initDashboard);
