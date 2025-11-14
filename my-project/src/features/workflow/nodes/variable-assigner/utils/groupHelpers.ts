import type { VariableGroup } from '../types'

/**
 * 기존 그룹 이름에서 다음 그룹 이름 생성
 */
export function generateNextGroupName(existingGroups: VariableGroup[]): string {
  if (existingGroups.length === 0) {
    return 'Group1'
  }

  let maxNum = 1
  existingGroups.forEach(group => {
    const match = /(\d+)$/.exec(group.group_name)
    if (match) {
      const num = parseInt(match[1], 10)
      if (num > maxNum) {
        maxNum = num
      }
    }
  })

  return `Group${maxNum + 1}`
}

/**
 * 그룹 이름 중복 확인
 */
export function isDuplicateGroupName(
  name: string,
  existingGroups: VariableGroup[],
  excludeGroupId?: string
): boolean {
  return existingGroups.some(
    group =>
      group.group_name === name &&
      (!excludeGroupId || group.groupId !== excludeGroupId)
  )
}

/**
 * 그룹 이름 유효성 검증
 */
export function validateGroupNameFormat(name: string): boolean {
  return /^[a-zA-Z0-9_-]{1,30}$/.test(name)
}
