#include "effects.h"

void pingPong(uint8_t portId, CRGB leds[], CRGB color, uint8_t num_leds)
{
    // Fill the entire strip with purple
    uint8_t sinBeat = beatsin8(30, 0, num_leds - 1, 0, 0);
    leds[sinBeat] = color;

    // Reduce brightness for whole strip every time it is called
    fadeToBlackBy(leds, num_leds, 10);
}

ColoredEffect pingPongEffect = {Effect::PingPong, &pingPong};
