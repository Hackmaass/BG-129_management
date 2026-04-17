import { auth } from './auth-logic.js';

const API_BASE_URL = '/api/automations';

const request = async (path = '', options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}${path}`;
    const response = await fetch(url, { ...options, headers });
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'Request failed');
    }
    return result;
};

const formatTrigger = (trigger) => {
    switch (trigger) {
        case 'new_product': return 'New Product';
        case 'price_drop': return 'Price Drop';
        case 'restock': return 'Restock';
        default: return trigger;
    }
};

const renderAutomations = async () => {
    const list = document.getElementById('automations-list');
    const noAuto = document.getElementById('no-automations');
    
    try {
        const result = await request();
        const automations = result.data || [];

        if (automations.length > 0) {
            noAuto.style.display = 'none';
            list.innerHTML = automations.map(a => `
                <div class="glass flex justify-between items-center" style="padding: 20px; border-left: 4px solid var(--primary);">
                    <div>
                        <div style="font-weight: 700; color: var(--text-bright); margin-bottom: 5px;">
                            ${formatTrigger(a.trigger)}
                        </div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">
                            Conditions: ${Object.keys(a.conditions).length > 0 
                                ? `${a.conditions.category || 'Any category'}${a.conditions.maxPrice ? ` < $${a.conditions.maxPrice}` : ''}` 
                                : 'Any match'}
                        </div>
                    </div>
                    <button class="icon-btn" onclick="deleteAutomation('${a.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
        } else {
            noAuto.style.display = 'block';
            list.innerHTML = '';
            list.appendChild(noAuto);
        }
    } catch (error) {
        console.error("Failed to load automations:", error);
    }
};

window.deleteAutomation = async (id) => {
    if (!confirm('Are you sure you want to stop this automation?')) return;
    try {
        await request(`/${id}`, { method: 'DELETE' });
        renderAutomations();
    } catch (error) {
        alert(error.message);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('automation-form');
    const aiToggle = document.getElementById('ai-generate-toggle');
    const aiPanel = document.getElementById('ai-panel');
    const aiParseBtn = document.getElementById('ai-parse-btn');
    const aiPrompt = document.getElementById('ai-prompt');
    const aiSuggestion = document.getElementById('ai-suggestion');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const trigger = document.getElementById('a-trigger').value;
            const category = document.getElementById('a-category').value;
            const maxPrice = document.getElementById('a-maxPrice').value;

            const conditions = {};
            if (category) conditions.category = category;
            if (maxPrice) conditions.maxPrice = parseFloat(maxPrice);

            try {
                await request('/', {
                    method: 'POST',
                    body: JSON.stringify({ trigger, conditions, action: { type: 'notify' } })
                });
                renderAutomations();
                form.reset();
            } catch (error) {
                alert(error.message);
            }
        });
    }

    if (aiToggle) {
        aiToggle.addEventListener('click', () => {
            aiPanel.style.display = aiPanel.style.display === 'none' ? 'block' : 'none';
        });
    }

    if (aiParseBtn) {
        aiParseBtn.addEventListener('click', async () => {
            const prompt = aiPrompt.value.trim();
            if (!prompt) return;

            aiParseBtn.disabled = true;
            aiParseBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

            try {
                const result = await request('/generate', {
                    method: 'POST',
                    body: JSON.stringify({ prompt })
                });

                const data = result.data;
                aiSuggestion.style.display = 'block';
                aiSuggestion.innerHTML = `
                    <div style="font-size: 0.9rem; margin-bottom: 10px;">${data.description}</div>
                    <button class="btn btn-block" id="apply-ai-btn" style="padding: 5px 10px; font-size: 0.8rem;">Create This Rule</button>
                `;

                document.getElementById('apply-ai-btn').addEventListener('click', async () => {
                    await request('/', {
                        method: 'POST',
                        body: JSON.stringify({ trigger: data.trigger, conditions: data.conditions, action: data.action })
                    });
                    renderAutomations();
                    aiSuggestion.style.display = 'none';
                    aiPrompt.value = '';
                });
            } catch (error) {
                alert("AI service failed. Please enter the rule manually.");
            } finally {
                aiParseBtn.disabled = false;
                aiParseBtn.innerHTML = 'Analyze';
            }
        });
    }

    renderAutomations();
});
