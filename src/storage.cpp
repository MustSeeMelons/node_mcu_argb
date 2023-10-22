#include "../lib/storage.h"

extern EEPROMClass *ourEEPROM;

void fillPortData(EEPROMPortData *portData)
{
    EEPROMPortData data;
    ourEEPROM->get(0, data);

    portData->d1 = data.d1;
    portData->d2 = data.d2;
    portData->brightness = data.brightness;
    portData->v = data.v;
}

void savePortData(EEPROMPortData *portData)
{
    ourEEPROM->put(0, *portData);
}

void saveVersion()
{
    uint32 offset = offsetof(EEPROMPortData, v);
    ourEEPROM->put(offset, storageVersion);
}

void fillPaletteData(EEPROMPalette *paletteData)
{
    ourEEPROM->get(sizeof(EEPROMPortData), paletteData);
}

void savePaletteData(EEPROMPalette *paletteData)
{
    ourEEPROM->put(sizeof(EEPROMPortData), *paletteData);
}

// Saves a record & updates the supplied offset accordingly
void saveEEPROMStringRecord(int32 *offset, EEPROMStringRecord *record)
{
    ourEEPROM->write(*offset, record->length + 1);
    *offset += sizeof(record->length);

    char data[record->data.length() + 1];
    record->data.toCharArray(data, record->data.length() + 1);

    for (uint8_t i = 0; i < record->length + 1; i++)
    {
        ourEEPROM->write(*offset + i, data[i]);
    }

    *offset += record->length + 1;
}

void saveWifiData(EEPROMWifiData *wifiData)
{
    // Get initial offset
    int32 offset = sizeof(EEPROMPortData) + sizeof(EEPROMPalette);

    ourEEPROM->write(offset, wifiData->deviceId);
    offset += sizeof(wifiData->deviceId);

    // Save ssid
    saveEEPROMStringRecord(&offset, &wifiData->ssid);

    // Save password
    saveEEPROMStringRecord(&offset, &wifiData->password);

    // Update the flesh
    ourEEPROM->commit();
}

void fillWifiData(EEPROMWifiData *wifiData)
{
    // Get initial offset
    int32 offset = sizeof(EEPROMPortData) + sizeof(EEPROMPalette);

    uint8_t deviceId = EEPROM.read(offset);
    offset += sizeof(deviceId);

    wifiData->deviceId = deviceId;

    uint8_t ssidLength = EEPROM.read(offset);

    offset += sizeof(ssidLength);

    char ssidData[ssidLength + 1];

    for (size_t i = 0; i < ssidLength; i++)
    {
        ssidData[i] = EEPROM.read(offset);
        offset++;
    }

    wifiData->ssid.length = ssidLength;
    wifiData->ssid.data = String(ssidData);

    uint8_t passLength = EEPROM.read(offset);
    offset += sizeof(passLength);

    char passData[passLength + 1];

    for (size_t i = 0; i < passLength; i++)
    {
        passData[i] = EEPROM.read(offset);
        offset++;
    }

    wifiData->password.length = passLength;
    wifiData->password.data = String(passData);
}