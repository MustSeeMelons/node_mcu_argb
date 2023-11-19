// #include "../lib/effects.h"
// #include "elapsedMillis.h"

// static elapsedMillis stamp[portCount];
// static elapsedMillis otherStmap[portCount];
// static elapsedMillis lastStamp[portCount];

// static elapsedMillis fadeStamp[portCount];

// uint16 stampStep = 7000;
// uint32 stepVariation = 6000;

// static CHSV black = rgb2hsv_approximate(CRGB::Black);
// static CHSV targets[portCount][ledCountMax] = {};
// static bool isFadeIn[portCount][ledCountMax] = {};
// static CRGB colorStash[portCount][configColorCount] = {};
// static int16_t brightness[portCount][ledCountMax] = {};

// void christmasSetup(uint8_t portId, CRGB colors[5])
// {
//     for (size_t i = 0; i < configColorCount; i++)
//     {
//         colorStash[portId][i] = colors[i];
//     }
// }

// void christmas(uint8_t portId, CRGB leds[], int16_t speed, uint8_t num_leds)
// {
//     // Color Tick
//     if (stamp[portId] > stampStep)
//     {
//         for (size_t i = 0; i < num_leds; i += 3)
//         {
//             targets[portId][i] = rgb2hsv_approximate(colorStash[portId][0]);
//             isFadeIn[portId][i] = true;
//         }

//         stamp[portId] = 0;
//     }

//     if (otherStmap[portId] > stampStep + stepVariation)
//     {
//         for (size_t i = 0; i < num_leds; i += 3)
//         {
//             targets[portId][i + 1] = rgb2hsv_approximate(colorStash[portId][1]);
//             isFadeIn[portId][i + 1] = true;
//         }

//         otherStmap[portId] = 0;
//     }

//     if (lastStamp[portId] > stampStep + stepVariation * 2)
//     {
//         for (size_t i = 0; i < num_leds; i += 3)
//         {
//             targets[portId][i + 2] = rgb2hsv_approximate(colorStash[portId][2]);
//             isFadeIn[portId][i + 2] = true;
//         }

//         lastStamp[portId] = 0;
//     }

//     // Don't fade on each call
//     if (fadeStamp[portId] > 40)
//     {
//         fadeStamp[portId] = 0;
//     }
//     else
//     {
//         return;
//     }

//     // Fade In Colors
//     for (size_t i = 0; i < num_leds; i++)
//     {
//         if (isFadeIn[portId][i])
//         {
//             CHSV c = targets[portId][i];

//             if (brightness[portId][i] + speed > 255)
//             {
//                 brightness[portId][i] = 255;
//             }
//             else
//             {
//                 brightness[portId][i] += speed;
//             }

//             leds[i] = CHSV(c.h, c.v, brightness[portId][i]);

//             if (brightness[portId][i] == 255)
//             {
//                 isFadeIn[portId][i] = false;
//             }
//         }
//     }

//     // Fade Out Colors
//     for (size_t i = 0; i < num_leds; i++)
//     {
//         if (!isFadeIn[portId][i] && brightness[portId][i] != 0)
//         {
//             CHSV c = targets[portId][i];

//             if (brightness[portId][i] - speed < 0)
//             {
//                 brightness[portId][i] = 0;
//             }
//             else
//             {
//                 brightness[portId][i] -= speed;
//             }

//             leds[i] = CHSV(c.h, c.v, brightness[portId][i]);
//         }
//     }
// }

// ExpandedEffect christmasEffect = {Effect::Christmas, &christmasSetup, &christmas};
