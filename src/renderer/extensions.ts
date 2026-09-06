/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2023 Comcast Cable Communications Management, LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { RendererMain } from '@lightningjs/renderer';
import { renderer } from './renderer.js';

interface WebFontEntry {
  family: string;
  url: string;
  metrics?: Record<string, number>;
}

interface SdfFontEntry {
  family: string;
  url: string;
  jsonUrl: string;
  metrics?: Record<string, number>;
}

interface EffectEntry {
  name: string;
  effect: any;
}

const webFonts: WebFontEntry[] = [];
const sdfFonts: SdfFontEntry[] = [];
const effects: EffectEntry[] = [];

const isMetricsLike = (obj: unknown): obj is Record<string, number> => {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  const keys = Object.keys(obj);
  return keys.some((k) =>
    ['ascender', 'descender', 'lineGap', 'unitsPerEm'].includes(k),
  );
};

/**
 * Register a Canvas web font (.ttf/.woff/.woff2).
 *
 * Can be called before or after {@link initRenderer}. Fonts registered before
 * init are loaded right after the renderer is created; fonts registered after
 * init are loaded immediately.
 *
 * Backwards compatible with the 0.6.x signature
 * `addWebFont(family, descriptors, url)`.
 */
export const addWebFont = (
  family: string,
  descriptorsOrUrl: Record<string, unknown> | string,
  url?: string,
) => {
  let fontUrl: string;
  let metrics: Record<string, number> | undefined;

  if (typeof descriptorsOrUrl === 'string') {
    fontUrl = descriptorsOrUrl;
  } else {
    if (url === undefined) {
      throw new Error(
        `addWebFont('${family}'): missing font URL. Use addWebFont(family, url) or addWebFont(family, descriptors, url).`,
      );
    }
    fontUrl = url;
    if (isMetricsLike(descriptorsOrUrl)) {
      metrics = descriptorsOrUrl as Record<string, number>;
    }
  }

  const entry = { family, url: fontUrl, metrics };
  webFonts.push(entry);

  if (renderer) {
    loadWebFont(renderer, entry).catch((err) =>
      console.error(`Failed to load web font '${family}':`, err),
    );
  }
};

/**
 * Register an SDF font (pre-generated atlas png + json).
 *
 * Backwards compatible with the 0.6.x signature
 * `addSdfFont(family, descriptors, type, url, jsonUrl)`. The old `type`
 * ('ssdf' | 'msdf') and `descriptors` arguments are accepted but ignored
 * (except when descriptors look like font metrics, in which case they are
 * forwarded as metrics).
 */
export const addSdfFont = (
  family: string,
  descriptorsOrType: Record<string, unknown> | string,
  typeOrUrl: string,
  urlOrJsonUrl?: string,
  jsonUrl?: string,
) => {
  let atlasUrl: string;
  let atlasDataUrl: string;
  let metrics: Record<string, number> | undefined;

  if (jsonUrl !== undefined && urlOrJsonUrl !== undefined) {
    // full old signature: (family, descriptors, type, url, jsonUrl)
    atlasUrl = urlOrJsonUrl;
    atlasDataUrl = jsonUrl;
    if (isMetricsLike(descriptorsOrType)) {
      metrics = descriptorsOrType as Record<string, number>;
    }
  } else if (urlOrJsonUrl !== undefined) {
    // (family, type, url, jsonUrl) without descriptors
    atlasUrl = typeOrUrl;
    atlasDataUrl = urlOrJsonUrl;
  } else {
    // new minimal signature: (family, url, jsonUrl)
    atlasUrl = descriptorsOrType as string;
    atlasDataUrl = typeOrUrl;
  }

  const entry = { family, url: atlasUrl, jsonUrl: atlasDataUrl, metrics };
  sdfFonts.push(entry);

  if (renderer) {
    loadSdfFont(renderer, entry).catch((err) =>
      console.error(`Failed to load SDF font '${family}':`, err),
    );
  }
};

export const addEffect = (name: string, effect: any) => {
  const entry = { name, effect };
  effects.push(entry);

  if (renderer) {
    registerEffect(renderer, entry);
  }
};

const loadWebFont = async (r: RendererMain, { family, url, metrics }: WebFontEntry) => {
  await r.stage.loadFont('canvas', {
    fontFamily: family,
    fontUrl: url,
    ...(metrics ? { metrics: metrics as any } : {}),
  });
};

const loadSdfFont = async (
  r: RendererMain,
  { family, url, jsonUrl, metrics }: SdfFontEntry,
) => {
  await r.stage.loadFont('sdf', {
    fontFamily: family,
    atlasUrl: url,
    atlasDataUrl: jsonUrl,
    ...(metrics ? { metrics: metrics as any } : {}),
  });
};

const registerEffect = (r: RendererMain, { name, effect }: EffectEntry) => {
  r.stage.shManager.registerShaderType(name, effect);
};

/**
 * Load all queued fonts and register all queued shader effects.
 * Called once by {@link initRenderer} after the Renderer is constructed.
 */
export const flushExtensions = async (r: RendererMain) => {
  for (const entry of webFonts) {
    await loadWebFont(r, entry);
  }

  for (const entry of sdfFonts) {
    await loadSdfFont(r, entry);
  }

  for (const entry of effects) {
    registerEffect(r, entry);
  }
};
