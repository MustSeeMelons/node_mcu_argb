#include "../lib/effects.h"
#include "elapsedMillis.h"

static CRGBPalette16 *ourPalette[portCount] = {nullptr, nullptr, nullptr, nullptr};

void bounceSetup(uint8_t portId, CRGB colors[5])
{
    if (ourPalette[portId] != nullptr)
    {
        delete ourPalette[portId];
    }

    ourPalette[portId] = new CRGBPalette16(colors[0], colors[1], colors[2]);
}

void bounce(uint8_t portId, CRGB leds[], int16_t speed, uint8_t num_leds)
{

    uint8_t beatSin = beatsin8(speed, 0, 255, 0, 0);

    fill_palette(leds, num_leds, beatSin, 255 / num_leds, *ourPalette[portId], 255, LINEARBLEND);
}

ExpandedEffect paletteBounceEffect = {Effect::PaletteBounce, &bounceSetup, &bounce};
