#include "../lib/effects.h"

static uint8_t calcBeatCount(uint8_t led_count)
{
    if (led_count < 10)
    {
        return 30;
    }
    else
    {
        return 10;
    }
}

void funkyBear(uint8_t portId, CRGB leds[], CRGB color, CRGB otherColor, uint8_t num_leds)
{
    uint8_t beatSin = beatsin8(calcBeatCount(num_leds), 0, num_leds - 1, 0, 0);
    uint8_t othrBeatSin = beatsin8(calcBeatCount(num_leds), 0, num_leds - 1, 0, 124);

    leds[beatSin] = color;
    leds[othrBeatSin] = otherColor;

    fadeToBlackBy(leds, num_leds, 10);
}

DualColorEffect funkyBeatEffect = {Effect::FunkyBeat, &funkyBear};
