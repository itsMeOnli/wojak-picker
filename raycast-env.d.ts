/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Supabase URL - Project URL, for example https://your-project.supabase.co */
  "supabaseUrl"?: string,
  /** Supabase Anon Key - Public anon key used by the Raycast extension */
  "supabaseAnonKey"?: string,
  /** Supabase Bucket - Storage bucket name for Wojak images */
  "supabaseBucket": string
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

