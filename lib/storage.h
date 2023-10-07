#ifndef Storage_h
#define Storage_h

#include <Arduino.h>
#include <EEPROM.h>
#include "port-configuration.h"
#include "definitions.h"

// Variable length record
struct EEPROMStringRecord
{
    uint8_t length;
    String data;
};

// Wifi stuffs
struct EEPROMWifiData
{
    uint8_t deviceId;
    EEPROMStringRecord ssid;
    EEPROMStringRecord password;
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

void saveEEPROMStringRecord(int32 *offset, EEPROMStringRecord *record);

void saveWifiData(EEPROMWifiData *wifiData);

void fillWifiData(EEPROMWifiData *wifiData);

void saveVersion();

#endif