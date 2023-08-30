#include "../lib/effects.h"

#include "elapsedMillis.h"

static elapsedMillis stamp;

void singleColor(uint8_t portId, CRGB leds[], CRGB color, uint8_t num_leds)
{
    if (stamp > 1000)
    {
        fill_solid(leds, num_leds, color);
    }
}

ColoredEffect staticEffect = {Effect::Static, &singleColor};
