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

import {
    CoreExtension,
    WebTrFontFace,
    SdfTrFontFace,
    type Stage,
    type TrFontFaceDescriptors,
} from '@lightningjs/renderer/core';

// not exported by the renderer so lets define it here
type SdfFontType = 'ssdf' | 'msdf';

let webFonts: { family: string; descriptors: Partial<TrFontFaceDescriptors>; url: string; }[] = [];
let sdfFonts: { family: string; descriptors: Partial<TrFontFaceDescriptors>; type: SdfFontType; url: string; jsonUrl: string; }[] = [];
let effects: { name: string; effect: any; }[] = [];

export const addWebFont = (family: string, descriptors: Partial<TrFontFaceDescriptors>, url: string) => {
    webFonts.push({ family, descriptors, url });
}

export const addSdfFont = (family: string, descriptors: Partial<TrFontFaceDescriptors>, type: SdfFontType, url: string, jsonUrl: string) => {
    sdfFonts.push({ family, descriptors, type, url, jsonUrl });
}

export const addEffect = (name: string, effect: any) => {
    effects.push({ name, effect });
}

export default class Extensions extends CoreExtension {
    async run(stage: Stage) {
    webFonts.forEach(({ family, descriptors, url }) => {
        stage.fontManager.addFontFace(
            new WebTrFontFace(family, descriptors, url),
        );
    });

    sdfFonts.forEach(({ family, descriptors, type, url, jsonUrl }) => {
        stage.fontManager.addFontFace(
            new SdfTrFontFace(family, descriptors, type, stage, url, jsonUrl),
        );
    });

    //@ts-ignore TS wants to define 'name' as keyof ShaderEffect, however that type isnt exposed by the renderer
    effects.forEach(({ name, effect }) => stage.shManager.registerEffectType(name, effect));
  }
}