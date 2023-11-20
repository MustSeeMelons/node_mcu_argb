#ifndef definitions_h
#define definitions_h

#include <Arduino.h>

const uint32_t storageVersion = 16;

const uint8_t paletteColorCount = 21;

const uint16 ledCountMax = 256;

const uint8_t configColorCount = 3;

enum Effect
{
    PingPong = 0,
    Stars = 1,
    Static = 2,
    FunkyBeat = 3,
    VerticalWing = 4,
    HorizontalWing = 5,
    PaletteSlide = 6,
    PaletteBounce = 7,
    Christmas = 8
};

const uint8_t portCount = 4;

enum PortDefinition : uint8_t
{
    IdD1 = 0,
    IdD2 = 1,
    IdD5 = 2,
    IdD6 = 3
};

#endif // definitions_h