#include <Arduino.h>
#include <FastLED.h>
#include "../lib/port-configuration.h"
#include "../lib/effects.h"
#include "../lib/effect-index.h"

#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include "FS.h"
#include "ArduinoJson.h"
#include "../lib/storage.h"
#include <EEPROM.h>
#include "elapsedMillis.h"

#define EEPROM_SIZE 1024

//// FastLed Things
#define DI_PIN_ONE D1
#define DI_PIN_TWO D2
#define DI_PIN_FIVE D5
#define DI_PIN_SIX D6

#define LED_LENGHT_MAX 512

#define BRIGHTNESS 255
#define LED_TYPE WS2812B
#define COLOR_ORDER GRB

bool isRestart = false;
elapsedMillis restartTimer;

// Make sure we use the same instance everywhere
EEPROMClass *ourEEPROM = &EEPROM;

CRGB leds_one[LED_LENGHT_MAX];
CRGB leds_two[LED_LENGHT_MAX];
CRGB leds_three[LED_LENGHT_MAX];
CRGB leds_four[LED_LENGHT_MAX];

// We were defiend elsewhere, but that was cauing issues
struct PortConfiguration PortD1 = {
    PortDefinition::IdD1,
    7,
    3,
    true,
    {.colors = {CRGB::Blue, CRGB::Red}}};

struct PortConfiguration PortD2 = {
    PortDefinition::IdD2,
    90,
    0,
    true,
    CRGB::Green};

struct PortConfiguration PortD5 = {
    PortDefinition::IdD5,
    12,
    4,
    true,
    CRGB::Red};

struct PortConfiguration PortD6 = {
    PortDefinition::IdD6,
    12,
    4,
    true,
    CRGB::Red};

EEPROMPalette palette = {CRGB(0, 0, 0)};

EEPROMWifiData wifiData;

PortConfiguration *currentPort;

void *d1Pointer;
void *d2Pointer;
void *d5Pointer;
void *d6Pointer;

extern const uint8 coloredEffectCount;
extern const uint8_t dualEffectCount;

extern ColoredEffect coloredEffects[];
extern DualColorEffect dualColorEffects[];

void updateColoredEffect(PortConfiguration *port, void **effectPointer)
{
  for (size_t i = 0; i < coloredEffectCount; i++)
  {
    if (coloredEffects[i].id == port->effectId)
    {
      *effectPointer = &coloredEffects[i];
    }
  }
}

void updateDualColoredEffect(PortConfiguration *port, void **effectPointer)
{
  for (size_t i = 0; i < dualEffectCount; i++)
  {
    if (dualColorEffects[i].id == port->effectId)
    {
      *effectPointer = &dualColorEffects[i];
    }
  }
}

// Update effect reference to current port id
void updateEffects()
{
  updateColoredEffect(&PortD1, &d1Pointer);
  updateColoredEffect(&PortD2, &d2Pointer);
  updateColoredEffect(&PortD5, &d5Pointer);
  updateColoredEffect(&PortD6, &d6Pointer);

  updateDualColoredEffect(&PortD1, &d1Pointer);
  updateDualColoredEffect(&PortD2, &d2Pointer);
  updateDualColoredEffect(&PortD5, &d5Pointer);
  updateDualColoredEffect(&PortD6, &d6Pointer);
}

//// WiFi Stuff
const char *ssid = "Pukeko";
const char *password = "SeptiniKabaci1";

ESP8266WebServer server(80);

String getContentType(String filename)
{ // convert the file extension to the MIME type
  if (filename.endsWith(".html"))
  {
    return "text/html";
  }
  else if (filename.endsWith(".css"))
  {
    return "text/css";
  }
  else if (filename.endsWith(".js"))
  {
    return "application/javascript";
  }
  else if (filename.endsWith(".ico"))
  {
    return "image/x-icon";
  }
  else if (filename.endsWith(".gz"))
  {
    return "application/x-gzip";
  }
  else
  {
    return "text/plain";
  }
}

void handleSinglePortLoad(PortConfiguration *port, JsonArray *ports)
{
  JsonObject obj = ports->createNestedObject();

  obj["id"] = port->id;
  obj["ledCount"] = port->ledCount;
  obj["effectId"] = port->effectId;
  obj["isEnabled"] = port->isEnabled;

  switch (port->effectId)
  {
  case Effect::PingPong:
  case Effect::Stars:
  case Effect::Static:
  case Effect::VerticalWing:
  case Effect::HorizontalWing:
  {
    JsonObject dColor = obj.createNestedObject("color");

    dColor["r"] = port->details.color.r;
    dColor["g"] = port->details.color.g;
    dColor["b"] = port->details.color.b;
    break;
  }
  case Effect::FunkyBeat:
  {
    JsonArray colors = obj.createNestedArray("colors");

    JsonObject c1 = colors.createNestedObject();
    c1["r"] = port->details.colors[0].r;
    c1["g"] = port->details.colors[0].g;
    c1["b"] = port->details.colors[0].b;

    JsonObject c2 = colors.createNestedObject();
    c2["r"] = port->details.colors[1].r;
    c2["g"] = port->details.colors[1].g;
    c2["b"] = port->details.colors[1].b;
    break;
  }
  }
}

void handleLoad()
{
  StaticJsonDocument<4096> response;

  response["brightness"] = FastLED.getBrightness();

  JsonArray paletteColors = response.createNestedArray("paletteColors");

  for (size_t i = 0; i < paletteColorCount; i++)
  {
    auto color = paletteColors.createNestedObject();
    color["r"] = palette.colors[i].r;
    color["g"] = palette.colors[i].g;
    color["b"] = palette.colors[i].b;
  }

  JsonArray ports = response.createNestedArray("ports");

  handleSinglePortLoad(&PortD1, &ports);
  handleSinglePortLoad(&PortD2, &ports);
  handleSinglePortLoad(&PortD5, &ports);
  handleSinglePortLoad(&PortD6, &ports);

  JsonObject wifi = response.createNestedObject("wifi");

  wifi["deviceId"] = wifiData.deviceId;
  wifi["ssid"] = wifiData.ssid.data;
  wifi["password"] = wifiData.password.data;

  String output;
  serializeJson(response, output);

  server.send(200, "text/json", output);
}

void handleBrightness()
{
  bool hasBody = server.hasArg("plain");

  if (!hasBody)
  {
    server.send(200, "text/plain", "NOK - No params!");
    return;
  }

  StaticJsonDocument<32> request;
  deserializeJson(request, server.arg("plain"));

  uint8_t brightness = int(request["value"]);

  FastLED.setBrightness(brightness);

  server.send(200, "text/plain", "OK!");
}

void handleWifi()
{
  bool hasBody = server.hasArg("plain");

  if (!hasBody)
  {
    server.send(200, "text/plain", "NOK - No params!");
    return;
  }

  StaticJsonDocument<256> request;
  deserializeJson(request, server.arg("plain"));

  uint8_t deviceId = int(request["deviceId"]);

  String ssid = String(request["ssid"]);
  uint8_t ssidLength = int(request["ssidLength"]);

  String password = String(request["password"]);
  uint8_t passwordLength = int(request["passwordLength"]);

  wifiData.deviceId = deviceId;

  wifiData.ssid.data = ssid;
  wifiData.ssid.length = ssidLength;

  wifiData.password.data = password;
  wifiData.password.length = passwordLength;

  // Edge case when on a fresh startup we save only wifi settings
  // Version is part of the port struct, lazy fix, but oh well
  saveVersion();
  saveWifiData(&wifiData);

  server.send(200, "text/plain", "OK!");

  isRestart = true;
  restartTimer = 0;
}

void handleSave()
{
  bool hasBody = server.hasArg("plain");

  if (!hasBody)
  {
    server.send(200, "text/plain", "NOK - No Params!");
    return;
  }

  StaticJsonDocument<1024> request;
  deserializeJson(request, server.arg("plain"));

  uint8_t portId = int(request["id"]);

  switch (portId)
  {
  case PortDefinition::IdD1:
    currentPort = &PortD1;
    break;
  case PortDefinition::IdD2:
    currentPort = &PortD2;
    break;
  case PortDefinition::IdD5:
    currentPort = &PortD5;
    break;
  case PortDefinition::IdD6:
    currentPort = &PortD6;
    break;
  default:
    server.send(500, "text/plain", "Port not found!");
    return;
  }

  currentPort->effectId = int(request["effectId"]);
  currentPort->isEnabled = bool(request["isEnabled"]);

  switch (currentPort->effectId)
  {
  case Effect::PingPong:
  case Effect::Stars:
  case Effect::Static:
  case Effect::VerticalWing:
  case Effect::HorizontalWing:
    currentPort->details.color.r = int(request["color"]["r"]);
    currentPort->details.color.g = int(request["color"]["g"]);
    currentPort->details.color.b = int(request["color"]["b"]);
    break;
  case Effect::FunkyBeat:
    for (size_t i = 0; i < 2; i++)
    {
      auto color = request["colors"][i];
      currentPort->details.colors[i].r = color["r"];
      currentPort->details.colors[i].g = color["g"];
      currentPort->details.colors[i].b = color["b"];
    }
    break;
  }

  currentPort->ledCount = int(request["ledCount"]);

  updateEffects();

  EEPROMPortData portData;
  portData.v = storageVersion;
  portData.d1 = PortD1;
  portData.d2 = PortD2;
  portData.d5 = PortD5;
  portData.d6 = PortD6;
  portData.brightness = FastLED.getBrightness();

  savePortData(&portData);

  server.send(200, "text/plain", "OK!");
}

bool handleFileRead(String path)
{
  if (path.endsWith("/"))
    path += "index.html";                    // If a folder is requested, send the index file
  String contentType = getContentType(path); // Get the MIME type
  String pathWithGz = path + ".gz";
  if (SPIFFS.exists(pathWithGz) || SPIFFS.exists(path))
  {                                                     // If the file exists, either as a compressed archive, or normal
    if (SPIFFS.exists(pathWithGz))                      // If there's a compressed version available
      path += ".gz";                                    // Use the compressed version
    File file = SPIFFS.open(path, "r");                 // Open the file
    size_t sent = server.streamFile(file, contentType); // Send it to the client
    file.close();                                       // Close the file again

    return true;
  }

  return false;
}

void handleNotFound()
{
  if (!handleFileRead(server.uri()))
  {
    server.send(404, "text/plain", "404: Not Found");
  }
}

void handleCommit()
{
  ourEEPROM->commit();
  server.send(200, "text/plain", "OK!");
}

void handlePalette()
{
  bool hasBody = server.hasArg("plain");

  if (!hasBody)
  {
    server.send(200, "text/plain", "NOK - No params!");
    return;
  }

  StaticJsonDocument<1024> request;
  deserializeJson(request, server.arg("plain"));

  uint8_t index = int(request["index"]);

  if (index >= paletteColorCount)
  {
    server.send(200, "text/plain", "NOK - Invalid index!");
    return;
  }

  uint8_t r = int(request["color"]["r"]);
  uint8_t g = int(request["color"]["g"]);
  uint8_t b = int(request["color"]["b"]);

  if (r > 255 || g > 255 || b > 255)
  {
    server.send(200, "text/plain", "NOK - Color out of range!");
    return;
  }

  palette.colors[index].r = r;
  palette.colors[index].g = g;
  palette.colors[index].b = b;

  savePaletteData(&palette);

  EEPROM.commit();

  server.send(200, "text/plain", "OK!");
}

void assignPort(PortConfiguration *target, PortConfiguration *source)
{
  target->id = source->id;
  target->effectId = source->effectId;
  target->ledCount = source->ledCount;
  target->isEnabled = source->isEnabled;

  switch (source->effectId)
  {
  case Effect::PingPong:
  case Effect::Stars:
  case Effect::Static:
  case Effect::VerticalWing:
  case Effect::HorizontalWing:
    target->details.color.r = source->details.color.r;
    target->details.color.g = source->details.color.g;
    target->details.color.b = source->details.color.b;
    break;
  case Effect::FunkyBeat:
    target->details.colors[0].r = source->details.colors[0].r;
    target->details.colors[0].g = source->details.colors[0].g;
    target->details.colors[0].b = source->details.colors[0].b;

    target->details.colors[1].r = source->details.colors[1].r;
    target->details.colors[1].g = source->details.colors[1].g;
    target->details.colors[1].b = source->details.colors[1].b;
    break;
  }
}

void setup()
{
  ourEEPROM->begin(EEPROM_SIZE);

  EEPROMPortData portData;
  fillPortData(&portData);

  if (portData.v == storageVersion)
  {
    assignPort(&PortD1, &portData.d1);
    assignPort(&PortD2, &portData.d2);
    assignPort(&PortD5, &portData.d5);
    assignPort(&PortD6, &portData.d6);

    FastLED.setBrightness(portData.brightness);

    fillPaletteData(&palette);

    fillWifiData(&wifiData);
  }
  else
  {
    FastLED.setBrightness(BRIGHTNESS);

    // Set blank wifi & pass
    wifiData.password.data = "";
    wifiData.password.length = 0;
    wifiData.ssid.data = "";
    wifiData.ssid.length = 0;
    wifiData.deviceId = 1;

    saveWifiData(&wifiData);
  }

  // Initialize fastled for each port
  FastLED.addLeds<LED_TYPE, DI_PIN_ONE, COLOR_ORDER>(leds_one, PortD1.ledCount)
      .setCorrection(TypicalLEDStrip);

  FastLED.addLeds<LED_TYPE, DI_PIN_TWO, COLOR_ORDER>(leds_two, PortD2.ledCount)
      .setCorrection(TypicalLEDStrip);

  FastLED.addLeds<LED_TYPE, DI_PIN_FIVE, COLOR_ORDER>(leds_three, PortD5.ledCount)
      .setCorrection(TypicalLEDStrip);

  FastLED.addLeds<LED_TYPE, DI_PIN_SIX, COLOR_ORDER>(leds_four, PortD6.ledCount)
      .setCorrection(TypicalLEDStrip);

  // Fetch effect references to loop through
  updateEffects();

  // Wifi stuffs
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  // Wait for connection
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
  }

  String mdns = String("argb-") + String(wifiData.deviceId);

  MDNS.begin(mdns);

  if (!SPIFFS.begin())
  {
    SPIFFS.format();
    SPIFFS.begin();
  };

  server.on("/load", handleLoad);
  server.on("/save", handleSave);
  server.on("/commit", handleCommit);
  server.on("/brightness", handleBrightness);
  server.on("/palette", handlePalette);
  server.on("/wifi", handleWifi);
  server.onNotFound(handleNotFound);

  server.begin();
}

void processPort(PortConfiguration *port, void **effectPointer, CRGB leds[])
{
  if (!port->isEnabled)
  {
    fill_solid(leds, port->ledCount, CRGB::Black);
    return;
  }

  switch (port->effectId)
  {
  case Effect::PingPong:
  case Effect::Stars:
  case Effect::Static:
  case Effect::VerticalWing:
  case Effect::HorizontalWing:
    ((ColoredEffect *)*effectPointer)->process(port->id, leds, port->details.color, port->ledCount);
    break;
  case Effect::FunkyBeat:
    ((DualColorEffect *)*effectPointer)->process(port->id, leds, port->details.colors[0], port->details.colors[1], port->ledCount);
    break;
  default:
    break;
  }
}

void loop()
{
  processPort(&PortD1, &d1Pointer, leds_one);
  processPort(&PortD2, &d2Pointer, leds_two);
  processPort(&PortD5, &d5Pointer, leds_three);
  processPort(&PortD6, &d6Pointer, leds_four);

  FastLED.show();

  server.handleClient();
  MDNS.update();

  if (isRestart && restartTimer > 1000)
  {
    ESP.restart();
  }
}
