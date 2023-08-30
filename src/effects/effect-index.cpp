#include "../lib/effect-index.h"
#include "../lib/effects.h"

extern ColoredEffect pingPongEffect;
extern ColoredEffect starsEffect;
extern ColoredEffect staticEffect;
extern DualColorEffect funkyBeatEffect;
extern ColoredEffect verticalWingEffect;

ColoredEffect coloredEffects[coloredEffectCount] = {pingPongEffect, starsEffect, staticEffect, verticalWingEffect};

DualColorEffect dualColorEffects[dualEffectCount] = {funkyBeatEffect};