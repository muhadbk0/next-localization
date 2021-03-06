import React, { useEffect, useMemo } from 'react';
import { createContext, useState } from 'react';
import rosetta from 'rosetta';
// import rosetta from 'rosetta/debug';

export const I18nContext = createContext();

export const I18n = function (rosettaOpts) {
    const r = rosetta(rosettaOpts);
    return {
        onUpdate() {},
        t(...args) {
            return r.t(...args);
        },
        table(...args) {
            return r.table(...args);
        },
        set(locale, lngDict) {
            r.set(locale, lngDict);
            this.onUpdate();
        },
        locale(locale, lngDict) {
            if (locale === undefined) {
                // returns active locale
                return r.locale();
            } else {
                // set active locale
                r.locale(locale);
            }
            if (locale && lngDict) {
                r.set(locale, lngDict);
            }
            this.onUpdate();
        },
        withPlural(pluralRulesOptions = { type: 'ordinal' }) {
            const PR = new Intl.PluralRules(r.locale(), pluralRulesOptions);
            return (key, params, ...args) => {
                Object.keys(params).map((k) => {
                    if (typeof params[k] === 'number') {
                        let pkey = PR.select(params[k]);
                        params[k] = this.t(`${k}.${pkey}`);
                    }
                });
                return this.t(key, params, ...args);
            };
        }
    };
};

export default function I18nProvider({ children, locale = 'en', lngDict, i18nInstance }) {
    const [, setTick] = useState(0);
    const i18n = useMemo(() => {
        const instance = i18nInstance ?? I18n();
        instance.onUpdate = () => setTick((tick) => tick + 1);
        instance.locale(locale, lngDict);
        return instance;
    }, [i18nInstance]);

    useEffect(() => {
        i18n.locale(locale, lngDict);
    }, [locale, lngDict]);

    return <I18nContext.Provider value={{ ...i18n }}>{children}</I18nContext.Provider>;
}
