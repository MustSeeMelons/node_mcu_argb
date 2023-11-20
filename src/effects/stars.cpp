#include "effects.h"
#include "elapsedMillis.h"

static elapsedMillis stamps[4] = {};

static uint16_t calcDelay(uint8_t led_count)
{
    if (led_count < 20)
    {
        return 500;
    }
    else
    {
        return 100;
    }
}

void stars(uint8_t portId, CRGB leds[], CRGB color, uint8_t num_leds)
{
    if (stamps[portId] > calcDelay(num_leds))
    {
        uint8_t idx = random8(num_leds - 1);
        leds[idx] = color;

        stamps[portId] = 0;
    }

    if (stamps[portId] % 10 == 0)
    {
        fadeToBlackBy(leds, num_leds, 10);
    }
}

ColoredEffect starsEffect = {Effect::Stars, &stars};
