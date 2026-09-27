import { scenarios, scenarioForRoom } from '../data/scenarios'
import { helenStyleProfile } from '../data/helenStyleProfile'
import type { CreatorRefinement, GenerationResult, RoomPreferences } from '../types'
const wait = (ms: number) => new Promise(resolve => window.setTimeout(resolve, ms))
// Replace these two functions with API calls later. The UI only consumes their typed results.
export async function generateGenericMakeover(originalImage: string, preferences: RoomPreferences): Promise<GenerationResult> {
  await wait(3600)
  const scenario = scenarios[scenarioForRoom(preferences.roomType)]
  return { scenario: scenario.key, image: scenario.images.generic, plan: scenario.plan, illustrative: !originalImage.startsWith('/demo/') }
}
export async function applyCreatorStyle(generic: GenerationResult): Promise<CreatorRefinement> {
  await wait(2900)
  const scenario = scenarios[generic.scenario]
  void helenStyleProfile // Second-stage prompt input for a production image model.
  return { ...generic, image: scenario.images.helen, changes: scenario.changes }
}
