
import { listeners } from './listeners';

const dispatcher = new HttpDispatcher();

export async function dispatch(event: Event) {

  const listener = listeners.add(event.id);

  const res = await fetch('http://dispatcher:3000', {
    method: 'POST',
    body: JSON.stringify(event),
  });

  if (res.status !== 204) {
    throw new Error(`Unexpected status code: ${res.status}`);
  }

  return listener;
}
