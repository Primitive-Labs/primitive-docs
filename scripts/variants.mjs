// Single source of truth for the language+platform "variant" model used by the
// example corpus and the built agent guides.
//
// A variant is one published build of the guides: a language plus an optional
// platform. `platform: null` means platform-agnostic — the build applies to
// every platform the language runs on. Language and platform are independent
// dimensions in guides.json (`variants[]` entries carry `language` and/or
// `platform`; an omitted dimension means agnostic — see js-bao-wss#977); the
// composite id (`ts`, `swift`, future `swift_ios`) exists only locally, as the
// built-guide filename suffix (`<BASE>.<id>.md`).
//
// Adding a new variant (e.g. swift_ios) should be ONE entry here plus optional
// platform-override example files (`examples/<subject>/<op>.ios.swift`) — no
// edits to any consuming script.

// Known platform tokens permitted as a filename infix (`oauth.ios.swift`).
// The infix must come from this closed set so op names containing dots can
// never be misread as platform overrides.
export const PLATFORMS = new Set(["ios", "mac"]);

export const VARIANTS = [
  {
    id: "ts",
    language: "ts",
    platform: null, // platform-agnostic
    ext: "ts",
    fence: "typescript",
    label: "JavaScript", // human-docs code-group tab label (convention)
    harness: "ts", // compile gate in compile-examples.mjs
  },
  {
    id: "swift",
    language: "swift",
    platform: null,
    ext: "swift",
    fence: "swift",
    label: "Swift",
    harness: "swift-macos",
  },
  // Future, illustrative (do not declare until real content exists):
  // { id: "swift_ios", language: "swift", platform: "ios",
  //   ext: "swift", fence: "swift", label: "Swift (iOS)", harness: null },
];

// The default/back-compat build: guides.json `file` points at this variant's
// build, and render-agent-guide.mjs renders it when --lang is omitted.
export const DEFAULT_VARIANT_ID = "ts";

// Top-level `defaults` block emitted into guides.json — the (language,
// platform) the CLI assumes when a project declares neither.
export const MANIFEST_DEFAULTS = { language: "ts", platform: "web" };

export const variantById = new Map(VARIANTS.map((v) => [v.id, v]));

// Languages that have a platform-agnostic ("base") variant. Corpus parity is
// enforced over these: every example id must exist for every base language.
export function baseLanguages() {
  return [...new Set(VARIANTS.filter((v) => v.platform === null).map((v) => v.language))];
}

export function baseVariantForLanguage(language) {
  return VARIANTS.find((v) => v.language === language && v.platform === null);
}

// Example file paths (relative to examples/) for a variant + logical id, in
// precedence order: platform override first, base-language file as fallback.
//   ts        / auth/oauth → ["auth/oauth.ts"]
//   swift_ios / auth/oauth → ["auth/oauth.ios.swift", "auth/oauth.swift"]
export function exampleCandidates(variant, id) {
  if (variant.platform === null) return [`${id}.${variant.ext}`];
  return [`${id}.${variant.platform}.${variant.ext}`, `${id}.${variant.ext}`];
}

// Parse a corpus filename (path relative to examples/) into its logical id and
// variant. Returns null for non-corpus files (unrecognized extension). Throws
// on a platform override that doesn't correspond to a declared variant (typo /
// not-yet-declared guard). Dot-safety: only a trailing stem segment from the
// closed PLATFORMS set is treated as a platform infix, so op names containing
// dots parse as plain base files.
export function parseExampleFile(relPath) {
  const lastDot = relPath.lastIndexOf(".");
  if (lastDot === -1) return null;
  const ext = relPath.slice(lastDot + 1);
  const baseVariant = VARIANTS.find((v) => v.platform === null && v.ext === ext);
  if (!baseVariant) return null;
  const { language } = baseVariant;

  const stem = relPath.slice(0, lastDot); // "<subject>/<op>[.<platform>]"
  const segments = stem.split(".");
  const maybePlatform = segments[segments.length - 1];

  if (segments.length > 1 && PLATFORMS.has(maybePlatform)) {
    const variant = VARIANTS.find((v) => v.language === language && v.platform === maybePlatform);
    if (!variant) {
      throw new Error(
        `override ${relPath} targets undeclared variant (language=${language}, platform=${maybePlatform}) — add it to scripts/variants.mjs or rename the file`,
      );
    }
    return { id: segments.slice(0, -1).join("."), language, platform: maybePlatform, variant };
  }
  return { id: stem, language, platform: null, variant: baseVariant };
}

// guides.json `variants[]` entry for a templated guide build. Omitted
// dimensions mean agnostic.
export function manifestVariant(variant, base) {
  return {
    ...(variant.language !== null && { language: variant.language }),
    ...(variant.platform !== null && { platform: variant.platform }),
    file: `${base}.${variant.id}.md`,
  };
}
