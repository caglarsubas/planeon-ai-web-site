# PDF font provenance

The PDF renderer reuses the existing website's Inter 400 and Poppins 600 fonts. Local WOFF2-to-TTF conversion using FontTools 4.61.1 (WOFF support) avoids a PDFKit/FontKit WOFF2 subset error. No font is downloaded at runtime. The logo is the site's existing `public/brand/planeon-logo.png`.

| Input / output | SHA-256 |
| --- | --- |
| `public/fonts/inter-400.woff2` | `2301bb030a2bcaa9c763cc4771bd717aac16709c29eaba00673fcbe7cdf99a59` |
| `inter-400.ttf` | `34be2601570fb9f529ea2031b8fbb97728d718c52de37188596d7f811264397a` |
| `public/fonts/poppins-600.woff2` | `f4e80d9dfd374d02989b87a27b5ed4cb78fbb177c27f1478e9a8b0afb7513149` |
| `poppins-600.ttf` | `c57853535db1b8b9c654b59a15dc61330a74f642814b7e7661ff2c0a015cfa99` |

Both retain the SIL Open Font License 1.1. The complete copyright/license texts are included alongside them, obtained from the [Inter license](https://github.com/google/fonts/blob/main/ofl/inter/OFL.txt) and [Poppins license](https://github.com/google/fonts/blob/main/ofl/poppins/OFL.txt). No reserved font names are specified in those notices. No new typeface or brand treatment is introduced.
