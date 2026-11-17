// Web version of dialog.ts: react-native-web's Alert.alert does nothing, so
// use the browser's own dialogs (the confirm button label can't be changed).
import type { ConfirmOptions } from './dialog';

export type { ConfirmOptions };

export function confirm({ title, message, onConfirm }: ConfirmOptions): void {
  if (window.confirm(`${title}\n\n${message}`)) onConfirm();
}

export function notify(title: string, message: string): void {
  window.alert(`${title}\n\n${message}`);
}
