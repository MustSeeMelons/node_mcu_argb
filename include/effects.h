#ifndef effects_h
#define effects_h

#include <FastLED.h>
#include "definitions.h"

struct ColoredEffect
{
    uint8_t id;
    void (*process)(uint8_t portId, CRGB leds[], CRGB color, uint8_t num_leds);
};

struct DualColorEffect
{
    uint8_t id;
    void (*process)(uint8_t portId, CRGB leds[], CRGB color, CRGB otherColor, uint8_t num_leds);
};

struct ExpandedEffect
{
    uint8_t id;
    void (*setup)(uint8_t portId, CRGB colors[5]);
    void (*process)(uint8_t portId, CRGB leds[], int16_t speed, uint8_t num_leds);
};

#endif