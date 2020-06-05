export function hsvToRgb(hue, saturation, value) {
    // Using formula as found on
    // https://www.rapidtables.com/convert/color/hsv-to-rgb.html

    // Expects:
    // 0 <= hue <= 360
    // 0 <= saturation <= 1
    // 0 <= value <= 1

    const C = value * saturation
    const X = C * (1 - Math.abs((hue / 60) % 2 - 1))
    const m = value - C

    let R_, G_, B_
    if (hue < 60) {
        [R_, G_, B_] = [C, X, 0]
    } else if (hue < 120) {
        [R_, G_, B_] = [X, C, 0]
    } else if (hue < 180) {
        [R_, G_, B_] = [0, C, X]
    } else if (hue < 240) {
        [R_, G_, B_] = [0, X, C]
    } else if (hue < 300) {
        [R_, G_, B_] = [X, 0, C]
    } else {
        [R_, G_, B_] = [C, 0, X]
    }

    return {
        red: (R_ + m) * 255,
        green: (G_ + m) * 255,
        blue: (B_ + m) * 255,
    }
}
