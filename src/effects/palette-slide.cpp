#include "../lib/effects.h"
#include "elapsedMillis.h"

static elapsedMillis stamp[portCount];
static uint8_t pallette_index[portCount] = {0, 0, 0, 0};
static CRGBPalette16 *ourPalette[portCount] = {nullptr, nullptr, nullptr, nullptr};

void slideSetup(uint8_t portId, CRGB colors[5])
{
    if (ourPalette[portId] != nullptr)
    {
        delete ourPalette[portId];
    }

    ourPalette[portId] = new CRGBPalette16(colors[0], colors[1], colors[2]);
}

void slide(uint8_t portId, CRGB leds[], int16_t speed, uint8_t num_leds)
{
    fill_palette(leds, num_leds, pallette_index[portId], 255 / num_leds, *ourPalette[portId], 255, LINEARBLEND);

    if (stamp[portId] > abs(speed))
    {
        if (speed > 0)
        {
            pallette_index[portId]++;
        }
        else
        {
            pallette_index[portId]--;
        }

        stamp[portId] = 0;
    }
}

ExpandedEffect paletteSlideEffect = {Effect::PaletteSlide, &slideSetup, &slide};
