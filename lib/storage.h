#ifndef Storage_h
#define Storage_h

#include <Arduino.h>
#include <EEPROM.h>
#include "port-configuration.h"

// Variable length record
struct EEPROMRecord
{
    String data;
    int nextOffset;
};

// Wifi stuffs
struct EEPROMWifiData
{
    EEPROMRecord ssid;
    EEPROMRecord password;
};

// ARGB port configs
struct EEPROMPortData
{
    PortConfiguration d1;
    PortConfiguration d2;
    PortConfiguration d5;
    PortConfiguration d6;
    uint8_t brightness;
    uint32 v;
};

struct EEPROMPalette
{
    CRGB colors[21];
};

void fillPortData(EEPROMPortData *portData);

void savePortData(EEPROMPortData *portData);

void fillPaletteData(EEPROMPalette *paletteData);

void savePaletteData(EEPROMPalette *paletteData);

#endif