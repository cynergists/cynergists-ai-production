import { createInertiaApp } from '@inertiajs/react';
import { StrictMode, type ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import AppShell from './cynergists/App';
import { AdminLayout } from './cynergists/components/admin/AdminLayout';
import { PartnerPortalLayout } from './cynergists/components/partner/PartnerPortalLayout';
import { PortalLayout } from './cynergists/components/portal/PortalLayout';

const appName = import.meta.env.VITE_APP_NAME || 'Cynergists';
type PageModule = {
    default: ComponentType & { layout?: (page: JSX.Element) => JSX.Element };
};

const pages = import.meta.glob<PageModule>([
    './pages/**/*.tsx',
    './cynergists/pages/**/*.tsx',
]);

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => {
        const cynergistsPage = pages[`./cynergists/pages/${name}.tsx`];
        const corePage = pages[`./pages/${name}.tsx`];

        if (!cynergistsPage && !corePage) {
            throw new Error(`Page not found: ${name}`);
        }

        return (cynergistsPage || corePage)().then((module) => {
            const component = module.default;
            if (!component.layout) {
                if (name.startsWith('admin/') && name !== 'admin/ApproveUser') {
                    component.layout = (page: JSX.Element) => (
                        <AppShell>
                            <AdminLayout>{page}</AdminLayout>
                        </AppShell>
                    );
                } else if (
                    name.startsWith('portal/') &&
                    name !== 'portal/Onboarding'
                ) {
                    component.layout = (page: JSX.Element) => (
                        <AppShell>
                            <PortalLayout>{page}</PortalLayout>
                        </AppShell>
                    );
                } else if (name.startsWith('partner/')) {
                    component.layout = (page: JSX.Element) => (
                        <AppShell>
                            <PartnerPortalLayout>{page}</PartnerPortalLayout>
                        </AppShell>
                    );
                } else {
                    component.layout = (page: JSX.Element) => (
                        <AppShell>{page}</AppShell>
                    );
                }
            }
            return module;
        });
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );
    },
});
