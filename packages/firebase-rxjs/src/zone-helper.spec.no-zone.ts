import { ZoneHelper } from './zone-helper'

describe('ZoneHelper: no zone.js', () => {
  let zoneHelper: ZoneHelper

  beforeEach(() => {
    zoneHelper = new ZoneHelper()
  })

  it('zone.js should not be loaded', () => {
    expect(typeof Zone).toBe('undefined')
  })

  it('should not setup firebaseZone', () => {
    expect((zoneHelper as any).firebaseZone).toBeUndefined()
  })
})