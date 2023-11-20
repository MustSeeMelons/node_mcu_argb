#ifndef port_configuration_h
#define port_configuration_h

#include <Arduino.h>
#include <FastLED.h>
#include "definitions.h"

struct ExpandedDetails
{
    CRGB colors[configColorCount];
    int16_t speed;
};

union PortDetails
{
    CRGB color;
    CRGB colors[2];
    ExpandedDetails expanded;
};

struct PortConfiguration
{
    uint8_t id;
    uint16_t ledCount;
    uint16_t effectId;
    bool isEnabled;
    PortDetails details;
};

#endif