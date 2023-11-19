#include "../lib/effect-index.h"
#include "../lib/effects.h"

extern ColoredEffect pingPongEffect;
extern ColoredEffect starsEffect;
extern ColoredEffect staticEffect;
extern DualColorEffect funkyBeatEffect;
extern ColoredEffect verticalWingEffect;
extern ExpandedEffect paletteSlideEffect;
extern ExpandedEffect paletteBounceEffect;
// extern ExpandedEffect christmasEffect;

ColoredEffect coloredEffects[coloredEffectCount] = {pingPongEffect, starsEffect, staticEffect, verticalWingEffect};

DualColorEffect dualColorEffects[dualEffectCount] = {funkyBeatEffect};

ExpandedEffect expandedEffects[expandedEffectCount] = {paletteSlideEffect, paletteBounceEffect};