import { h, $ } from './dom.js';

export function toast(message, { actionLabel, onAction, timeout = 6000 } = {}) {
  const region = $('#toast-region');
  const remove = () => node.remove();
  const node = h('div', { class: 'toast' },
    h('span', { text: message }),
    actionLabel && h('button', { type: 'button', class: 'toast-action', text: actionLabel, onclick: () => { onAction?.(); remove(); } }),
  );
  region.append(node);
  setTimeout(remove, timeout);
}
