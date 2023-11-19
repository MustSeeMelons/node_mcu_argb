# TODO, somewhat prioritized

- Update effects to use a more detailed config (all 3x colors, speed)
- Move files from /lib to /include as it is incorrect, lol
- Moar effects! Christmas Lights?
- Proper error habndling in API, so ESP does not choke it self (?) ArduinoJSON?
- Update stand-alone by merging this

# TODO Details

## Update effects to use a more detailed config (all 3x colors, speed)

- `renderColorPicker` does not need to be updated! yay!
- If just one color is required - just use `colors[0]`. Same can be in the API handler
- Rendering does not need to change - only the update handler, yay!
- `getDetails` of save call needs to be updated
- `handleLoad` to always return the array
- `handleSave` to always expect an array
- `effects.h` to just one type - with the most data

# To update SPIFFS

- PlatformIO Menu
- Platform
- Build Filesystem Image
- Upload Filesystem Image
- Profit

# Bugz
