/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
export namespace Components {
    interface AdgCombobox {
        "ariaLiveAssertive": boolean;
        "filterLabel": string;
        "formControlName": string;
        "multi": boolean;
        "options": string[];
        "roleAlert": boolean;
        "showInstructions": boolean;
    }
}
declare global {
    interface HTMLAdgComboboxElement extends Components.AdgCombobox, HTMLStencilElement {
    }
    var HTMLAdgComboboxElement: {
        prototype: HTMLAdgComboboxElement;
        new (): HTMLAdgComboboxElement;
    };
    interface HTMLElementTagNameMap {
        "adg-combobox": HTMLAdgComboboxElement;
    }
}
declare namespace LocalJSX {
    interface AdgCombobox {
        "ariaLiveAssertive"?: boolean;
        "filterLabel"?: string;
        "formControlName"?: string;
        "multi"?: boolean;
        "options"?: string[];
        "roleAlert"?: boolean;
        "showInstructions"?: boolean;
    }
    interface IntrinsicElements {
        "adg-combobox": AdgCombobox;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "adg-combobox": LocalJSX.AdgCombobox & JSXBase.HTMLAttributes<HTMLAdgComboboxElement>;
        }
    }
}
