import { tick } from '@adernnell/simplereactivedom';
import { App } from './components/app';
import { init } from './core';

document.getElementById('app-content')!.replaceChildren(App());

tick().then(() => {
    init();
});