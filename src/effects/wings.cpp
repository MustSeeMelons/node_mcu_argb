#include "../lib/effects.h"

static const uint8_t lineCount = 6;
static const uint8_t lineElementCount = 2;
static uint8_t horizontalLineIndexes[lineCount][lineElementCount] = {{1, 2}, {0, 3}, {4, 11}, {5, 10}, {6, 9}, {7, 8}};
static uint8_t verticalLineIndexes[lineCount][lineElementCount] = {{4, 5}, {3, 6}, {2, 7}, {1, 8}, {0, 9}, {11, 10}};

void verticalWings(uint8_t portId, CRGB leds[], CRGB color, uint8_t num_leds)
{
    // If we are less than 12 leds, show something else
    if (num_leds < 12)
    {
        for (size_t i = 0; i < num_leds; i += 2)
        {
            leds[i] = color;
        }
        return;
    }

    const uint8_t beat = beatsin8(35, 0, lineCount - 1, 0, 0);

    for (size_t i = 0; i < lineElementCount; i++)
    {
        leds[verticalLineIndexes[beat][i]] = color;
    }

    fadeToBlackBy(leds, num_leds, 20);
}

void horizontalWings(uint8_t portId, CRGB leds[], CRGB color, uint8_t num_leds)
{
    // If we are less than 12 leds, show something else
    if (num_leds < 12)
    {
        for (size_t i = 0; i < num_leds; i += 2)
        {
            leds[i] = color;
        }
        return;
    }

    const uint8_t beat = beatsin8(35, 0, lineCount - 1, 0, 0);

    for (size_t i = 0; i < lineElementCount; i++)
    {
        leds[horizontalLineIndexes[beat][i]] = color;
    }

    fadeToBlackBy(leds, num_leds, 20);
}

ColoredEffect verticalWingEffect = {Effect::VerticalWing, &verticalWings};
ColoredEffect horizontalWingEffect = {Effect::HorizontalWing, &horizontalWings};