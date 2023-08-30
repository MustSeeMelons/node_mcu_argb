#include "../lib/storage.h"

extern EEPROMClass *ourEEPROM;

void fillPortData(EEPROMPortData *portData)
{
    EEPROMPortData data;
    ourEEPROM->get(0, data);

    portData->d1 = data.d1;
    portData->d2 = data.d2;
    portData->d5 = data.d5;
    portData->d6 = data.d6;
    portData->brightness = data.brightness;
    portData->v = data.v;
}

void savePortData(EEPROMPortData *portData)
{
    ourEEPROM->put(0, *portData);
}