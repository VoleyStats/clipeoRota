import { Alert } from 'react-native';

import { t } from '../strings';

export interface ConfirmOptions {
  title: string;
  message: string;
  /** Label of the button that runs `onConfirm`. */
  confirmText: string;
  destructive?: boolean;
  onConfirm: () => void;
}

/** Asks before doing something; `onConfirm` runs only if the user accepts. See dialog.web.ts for the web version. */
export function confirm({ title, message, confirmText, destructive, onConfirm }: ConfirmOptions): void {
  Alert.alert(title, message, [
    { text: t.cancel, style: 'cancel' },
    { text: confirmText, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
  ]);
}

/** Shows a message with a single OK button. */
export function notify(title: string, message: string): void {
  Alert.alert(title, message);
}
