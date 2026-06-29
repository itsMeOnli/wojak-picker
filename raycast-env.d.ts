/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Library Base URL - Where Wojak images are served from. Defaults to the public jsDelivr CDN. Override to point at your own host (e.g. https://wojaks.example.com). */
  "baseUrl": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `search-wojaks` command */
  export type SearchWojaks = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `search-wojaks` command */
  export type SearchWojaks = {}
}

