import { B2B_ENTITIES } from "@/lib/constants"
import type { KeywordGapEntry } from "@/types/database"

const COMPETITOR_NAMES = ["Pro HVAC Group", "Elite Mechanical", "Apex Climate Control"]

export function generateGapData(clientId: string): KeywordGapEntry[] {
  const data: KeywordGapEntry[] = []

  B2B_ENTITIES.forEach((entity) => {
    data.push({
      id: `${clientId}-client-${entity}`,
      clientId,
      entityName: entity,
      isClient: true,
      strength: Math.floor(Math.random() * 40) + 30,
      competitorId: null,
    })

    COMPETITOR_NAMES.forEach((compName, idx) => {
      data.push({
        id: `${clientId}-${idx}-${entity}`,
        clientId,
        entityName: entity,
        isClient: false,
        strength: Math.floor(Math.random() * 60) + 20,
        competitorId: `comp-${idx}`,
        competitorName: compName,
      })
    })
  })

  return data
}
