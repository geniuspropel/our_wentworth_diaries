export type RoomType = 'Living Room' | 'Bedroom' | 'Kitchen' | 'Dining Room' | 'Bathroom' | 'Home Office' | 'Other'
export type MakeoverLevel = 'Refresh' | 'Makeover' | 'Full Redesign'
export type ScenarioKey = 'living' | 'bedroom' | 'kitchen' | 'bathroom'
export interface RoomPreferences { roomType: RoomType; style: string; level: MakeoverLevel; preserve: string[]; change: string[] }
export interface PlanItem { title: string; detail: string }
export interface GenerationResult { scenario: ScenarioKey; image: string; plan: PlanItem[]; illustrative: boolean }
export interface CreatorStyleProfile { name: string; feeling: string[]; palette: string[]; materials: string[]; details: string[]; principles: string[]; avoid: string[] }
export interface CreatorRefinement extends GenerationResult { changes: string[] }
