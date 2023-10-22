#ifndef definitions_h
#define definitions_h

const uint32 storageVersion = 10;

const uint8_t paletteColorCount = 21;

enum Effect
{
    PingPong = 0,
    Stars = 1,
    Static = 2,
    FunkyBeat = 3,
    VerticalWing = 4,
    HorizontalWing = 5,
    PaletteSlide = 6,
    PaletteBounce = 7
};

const uint8_t portCount = 2;

enum PortDefinition
{
    IdD1 = 0,
    IdD2 = 1
};

#endif // definitions_h