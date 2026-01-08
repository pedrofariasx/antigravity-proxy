/**
 * Account Manager Component
 * Registers itself to window.Components for Alpine.js to consume
 */
window.Components = window.Components || {};

window.Components.accountManager = () => ({
    async refreshAccount(email) {
        const store = Alpine.store('global');
        store.showToast(store.t('refreshingAccount', { email }), 'info');
        const password = store.webuiPassword;
        try {
            const { response, newPassword } = await window.utils.request(`/api/accounts/${encodeURIComponent(email)}/refresh`, { method: 'POST' }, password);
            if (newPassword) store.webuiPassword = newPassword;

            const data = await response.json();
            if (data.status === 'ok') {
                store.showToast(store.t('refreshedAccount', { email }), 'success');
                Alpine.store('data').fetchData();
            } else {
                store.showToast(data.error || store.t('refreshFailed'), 'error');
            }
        } catch (e) {
            store.showToast(store.t('refreshFailed') + ': ' + e.message, 'error');
        }
    },

    async toggleAccount(email, enabled) {
        const store = Alpine.store('global');
        const password = store.webuiPassword;
        try {
            const { response, newPassword } = await window.utils.request(`/api/accounts/${encodeURIComponent(email)}/toggle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled })
            }, password);
            if (newPassword) store.webuiPassword = newPassword;

            const data = await response.json();
            if (data.status === 'ok') {
                const status = enabled ? store.t('enabledStatus') : store.t('disabledStatus');
                store.showToast(store.t('accountToggled', { email, status }), 'success');
                Alpine.store('data').fetchData();
            } else {
                store.showToast(data.error || store.t('toggleFailed'), 'error');
            }
        } catch (e) {
            store.showToast(store.t('toggleFailed') + ': ' + e.message, 'error');
        }
    },

    async fixAccount(email) {
        const store = Alpine.store('global');
        store.showToast(store.t('reauthenticating', { email }), 'info');
        const password = store.webuiPassword;
        try {
            const urlPath = `/api/auth/url?email=${encodeURIComponent(email)}`;
            const { response, newPassword } = await window.utils.request(urlPath, {}, password);
            if (newPassword) store.webuiPassword = newPassword;

            const data = await response.json();
            if (data.status === 'ok') {
                window.open(data.url, 'google_oauth', 'width=600,height=700,scrollbars=yes');
            } else {
                store.showToast(data.error || store.t('authUrlFailed'), 'error');
            }
        } catch (e) {
            store.showToast(store.t('authUrlFailed') + ': ' + e.message, 'error');
        }
    },

    async deleteAccount(email) {
        const store = Alpine.store('global');
        if (!confirm(store.t('confirmDelete'))) return;
        const password = store.webuiPassword;
        try {
            const { response, newPassword } = await window.utils.request(`/api/accounts/${encodeURIComponent(email)}`, { method: 'DELETE' }, password);
            if (newPassword) store.webuiPassword = newPassword;

            const data = await response.json();
            if (data.status === 'ok') {
                store.showToast(store.t('deletedAccount', { email }), 'success');
                Alpine.store('data').fetchData();
            } else {
                store.showToast(data.error || store.t('deleteFailed'), 'error');
            }
        } catch (e) {
            store.showToast(store.t('deleteFailed') + ': ' + e.message, 'error');
        }
    },

    async reloadAccounts() {
        const store = Alpine.store('global');
        const password = store.webuiPassword;
        try {
            const { response, newPassword } = await window.utils.request('/api/accounts/reload', { method: 'POST' }, password);
            if (newPassword) store.webuiPassword = newPassword;

            const data = await response.json();
            if (data.status === 'ok') {
                store.showToast(store.t('accountsReloaded'), 'success');
                Alpine.store('data').fetchData();
            } else {
                store.showToast(data.error || store.t('reloadFailed'), 'error');
            }
        } catch (e) {
            store.showToast(store.t('reloadFailed') + ': ' + e.message, 'error');
        }
    }
});
