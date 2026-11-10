# Third-party notices

This theme includes the third-party material listed here. Each notice is also repeated, as a comment, in the file it covers.

## Platform icons

`assets/android.svg`, `assets/apple.svg`, `assets/ios.svg`, `assets/macos.svg`, `assets/web.svg` and `assets/windows.svg` are the icons shown beside the platform names on the tabs of knowledge articles (see `src/articleTabs.js` and `styles/_article-tabs.scss`). They are named plainly so authors can refer to them by file name, the way service catalog icons are (`[icon: ios.svg]`). They are SVG so that they scale to their box at any size and pixel density; no raster image is used for them.

| File | Iconify icon | Creator | License |
| --- | --- | --- | --- |
| `ios.svg` | [`lineicons:ios`](https://icon-sets.iconify.design/lineicons/ios/) | [Lineicons](https://lineicons.com) | MIT |
| `windows.svg` | [`lineicons:microsoft`](https://icon-sets.iconify.design/lineicons/microsoft/) | [Lineicons](https://lineicons.com) | MIT |
| `apple.svg` | [`lineicons:apple-brand`](https://icon-sets.iconify.design/lineicons/apple-brand/) | [Lineicons](https://lineicons.com) | MIT |
| `android.svg` | [`lineicons:android`](https://icon-sets.iconify.design/lineicons/android/) | [Lineicons](https://lineicons.com) | MIT |
| `web.svg` | [`lineicons:globe-1`](https://icon-sets.iconify.design/lineicons/globe-1/) | [Lineicons](https://lineicons.com) | MIT |
| `macos.svg` | [`streamline-logos:mac-finder-logo-solid`](https://icon-sets.iconify.design/streamline-logos/mac-finder-logo-solid/) | Streamline ([Streamline Logos](https://github.com/webalys-hq/streamline-vectors)) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |

The icon data comes from [Iconify](https://iconify.design) ([lineicons](https://icon-sets.iconify.design/lineicons/) and [streamline-logos](https://icon-sets.iconify.design/streamline-logos/)). The only changes to any icon are the `viewBox`, which is cropped to the glyph so that the icons scale to comparable visual sizes, and the `width` and `height` that match it; the drawing itself is unchanged.

Apple, iOS, macOS, Finder, Microsoft, Windows and Android are trademarks of their respective owners. The icons only identify the platform a guide is written for and imply no endorsement.

### Lineicons (MIT)

Copyright (c) 2023 Lineicons

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Source: <https://github.com/LineiconsHQ/Lineicons/blob/main/LICENSE.md>

### Streamline Logos (CC BY 4.0)

"Mac Finder Logo Solid" by Streamline, from the Streamline Logos free icon set (<https://github.com/webalys-hq/streamline-vectors>), is licensed under the Creative Commons Attribution 4.0 International license (<https://creativecommons.org/licenses/by/4.0/>). It was modified for this theme only by cropping the `viewBox`.
