const HEX = /^#([0-9a-f]{6})$/i

export function normalizeHex(value) {
  const color = String(value || '').trim().toUpperCase()
  return HEX.test(color) ? color : null
}

export function hexToRgb(value) {
  const hex = normalizeHex(value)
  if (!hex) return null
  return { r: Number.parseInt(hex.slice(1, 3), 16), g: Number.parseInt(hex.slice(3, 5), 16), b: Number.parseInt(hex.slice(5, 7), 16) }
}

const channelToLinear = (channel) => {
  const value = channel / 255
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

export function luminance(value) {
  const rgb = hexToRgb(value)
  if (!rgb) return 0
  return (0.2126 * channelToLinear(rgb.r)) + (0.7152 * channelToLinear(rgb.g)) + (0.0722 * channelToLinear(rgb.b))
}

export function contrastRatio(first, second) {
  const light = Math.max(luminance(first), luminance(second))
  const dark = Math.min(luminance(first), luminance(second))
  return (light + 0.05) / (dark + 0.05)
}

export function mixHex(first, second, weight = 0.5) {
  const a = hexToRgb(first)
  const b = hexToRgb(second)
  const amount = Math.min(1, Math.max(0, weight))
  if (!a || !b) return normalizeHex(first) || '#000000'
  const channel = (key) => Math.round(a[key] + ((b[key] - a[key]) * amount)).toString(16).padStart(2, '0')
  return `#${channel('r')}${channel('g')}${channel('b')}`.toUpperCase()
}

export function readableText(background) {
  return contrastRatio('#FFFFFF', background) >= contrastRatio('#0F172A', background) ? '#FFFFFF' : '#0F172A'
}

export function accessibleAccent(color, background, minimum = 4.5) {
  const normalized = normalizeHex(color) || '#2563EB'
  if (contrastRatio(normalized, background) >= minimum) return normalized
  const target = luminance(background) > 0.45 ? '#000000' : '#FFFFFF'
  for (let step = 1; step <= 20; step += 1) {
    const candidate = mixHex(normalized, target, step / 20)
    if (contrastRatio(candidate, background) >= minimum) return candidate
  }
  return target
}

export function createBrandTokens(colors) {
  const primary = normalizeHex(colors?.primary) || '#2563EB'
  const secondary = normalizeHex(colors?.secondary) || '#1E3A8A'
  const accent = normalizeHex(colors?.accent) || '#60A5FA'
  const primaryRgb = hexToRgb(primary)
  const secondaryRgb = hexToRgb(secondary)
  const accentRgb = hexToRgb(accent)
  const primaryTarget = readableText(primary) === '#FFFFFF' ? '#000000' : '#FFFFFF'
  const secondaryTarget = readableText(secondary) === '#FFFFFF' ? '#000000' : '#FFFFFF'
  const isOriginalDrivique = primary === '#2563EB' && secondary === '#1E3A8A' && accent === '#60A5FA'

  return {
    primary, secondary, accent,
    primaryRgb: `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`,
    secondaryRgb: `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`,
    accentRgb: `${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}`,
    onPrimary: readableText(primary), onSecondary: readableText(secondary), onAccent: readableText(accent),
    primaryHover: isOriginalDrivique ? '#1D4ED8' : mixHex(primary, primaryTarget, 0.13),
    primaryActive: isOriginalDrivique ? '#1E40AF' : mixHex(primary, primaryTarget, 0.22),
    secondaryHover: isOriginalDrivique ? '#162D6E' : mixHex(secondary, secondaryTarget, 0.13),
    textLight: isOriginalDrivique ? '#1E3A8A' : accessibleAccent(primary, '#FFFFFF'),
    textDark: isOriginalDrivique ? '#93C5FD' : accessibleAccent(accent, '#0F172A'),
    borderLight: isOriginalDrivique ? '#93C5FD' : mixHex(primary, '#FFFFFF', 0.64),
    borderDark: isOriginalDrivique ? '#3C6599' : mixHex(accent, '#0F172A', 0.48),
    softLight: isOriginalDrivique ? '#EFF6FF' : mixHex(primary, '#FFFFFF', 0.9),
    softStrongLight: isOriginalDrivique ? '#DBEAFE' : mixHex(primary, '#FFFFFF', 0.8),
    softDark: mixHex(primary, '#0F172A', 0.78), softStrongDark: mixHex(primary, '#0F172A', 0.62),
  }
}
