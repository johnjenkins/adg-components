// https://github.com/UniversalViewer/uv-components/blob/master/src/utils/locale.ts
import { getAssetPath } from '@stencil/core';

function getComponentClosestLanguage(element: HTMLElement): string {
  let closestElement = element.closest('[lang]') as HTMLElement;
  return closestElement ? closestElement.lang : 'en';
}

function fetchLocaleStringsForComponent(
  componentName: string,
  locale: string,
  assetsPath?: string,
): Promise<any> {
  return new Promise((resolve, reject): void => {
    const localBase = assetsPath || getAssetPath('');
    fetch(localBase + `${componentName}.i18n.${locale}.json`).then(
      (result) => {
        if (result.ok) resolve(result.json());
        else reject();
      },
      () => reject()
    );
  });
}

async function getLocaleComponentStrings(
  element: HTMLElement,
  assetsPath?: string,
): Promise<any> {
  let componentName = element.tagName.toLowerCase();
  let componentLanguage = getComponentClosestLanguage(element);
  let strings;
  try {
    strings = await fetchLocaleStringsForComponent(
      componentName,
      componentLanguage,
      assetsPath,
    );
  } catch (e) {
    console.warn(
      `no locale for ${componentName} (${componentLanguage}) loading default locale en.`
    );
    strings = await fetchLocaleStringsForComponent(componentName, 'en', assetsPath);
  }
  return strings;
}
function TemplateEngine(
  tpl: string,
  data: object
  ) {
    // @ts-ignore
    return tpl.replace(/\$\(([^\)]+)?\)/g, function ($1, $2) {
      return `${$2.split('.').reduce((p, c) => p?.[c], data)}` || '';
    });
  };


export async function Translator(el: HTMLElement, assetsPath?: string) {
  const strings = await getLocaleComponentStrings(el, assetsPath);
  return (str, ...args) => {
    str = strings[str] || str;

    if (args.length === 1 && typeof args[0] === 'object') {
      return TemplateEngine(str, args[0]);
    }

    return str;
  }
}
