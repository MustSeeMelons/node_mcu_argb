#ifndef definitions_h
#define definitions_h

const uint32 storageVersion = 7;

const uint8_t paletteColorCount = 21;

enum Effect
{
    PingPong = 0,
    Stars = 1,
    Static = 2,
    FunkyBeat = 3,
    VerticalWing = 4,
    HorizontalWing = 5
};

enum PortDefinition
{
    IdD1 = 1,
    IdD2 = 2,
    IdD5 = 3,
    IdD6 = 4
};

#endif // definitions_h