import { html, node } from '@adernnell/simplereactivedom/template';
import { SettingsHeader } from '../settings-header';
import { FileList } from '../file-list';
import { InfoDialog } from '../info-dialog';
import { toastService } from '../toaster';
import './app.css';

export const App = () => {
    const infoDialog = InfoDialog();

    const appNode = node(html`
        <main class="app">
            ${SettingsHeader()}
            <hr class="divider" />
            ${FileList({ infoDialog })}
            ${infoDialog}
        </main>
    `) as HTMLElement;

    toastService.initToastContainer(appNode);

    return appNode;
};
