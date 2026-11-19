import { Fragment } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { savePrefs } from '../storage';
import { LANGS, setLang, useLang, useT, type Lang } from '../strings';
import { color, space } from '../ui/theme';

const NAMES: Record<Lang, string> = { es: 'Español', en: 'English' };

interface Props {
  style?: StyleProp<ViewStyle>;
  /** Called after the app language changes (e.g. to update the URL). */
  onChange?: (lang: Lang) => void;
  /** Language shown as selected, when the screen doesn't follow the app's (privacy `?lang=`). */
  value?: Lang;
}

/** Discreet «ES · EN» text switch: changes and remembers the language of the whole app. */
export function LangSwitch({ style, onChange, value }: Props) {
  const t = useT();
  const appLang = useLang();
  const selected = value ?? appLang;

  const choose = (lang: Lang) => {
    setLang(lang);
    savePrefs({ lang });
    onChange?.(lang);
  };

  return (
    <View style={[styles.root, style]} accessibilityRole="radiogroup" accessibilityLabel={t.language}>
      {LANGS.map((lang, i) => (
        <Fragment key={lang}>
          {i > 0 && <Text style={styles.dot}>·</Text>}
          <Pressable
            accessibilityRole="radio"
            accessibilityLabel={NAMES[lang]}
            accessibilityState={{ selected: lang === selected }}
            hitSlop={10}
            onPress={() => choose(lang)}
          >
            <Text style={[styles.code, lang === selected && styles.selected]}>{lang.toUpperCase()}</Text>
          </Pressable>
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  code: { fontSize: 13, fontWeight: '600', letterSpacing: 1, color: color.textMuted },
  selected: { color: color.textPrimary },
  dot: { fontSize: 13, color: color.textMuted },
});
