
export class LogSpec implements ZoneSpec {
  indent = 0
  name   = 'log-zone'

  log(msg: string) {
    console.log(`${'    '.repeat(this.indent)}${msg}`)
  }

  onIntercept(parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, delegate: Function,
              source: string) {
    this.log(`[onIntercept] ${source}`)
    return parentZoneDelegate.intercept(targetZone, delegate, source)
  }

  onInvoke(parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, delegate: Function,
           applyThis: any, applyArgs: any[], source: string) {
    this.log(`[onInvoke]:before ${targetZone.name} ${applyArgs}`)
    this.indent++
    const res = parentZoneDelegate.invoke(targetZone, delegate, applyThis, applyArgs, source)
    this.indent--
    this.log(`[onInvoke]:after ${targetZone.name}`)
    return res
  }

  onScheduleTask(parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, task: Task) {
    this.log(`[onScheduleTask] ${task.source}`)
    return parentZoneDelegate.scheduleTask(targetZone, task)
  }

  onInvokeTask(parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, task: Task,
               applyThis: any, applyArgs: any) {
    this.log(`[onInvokeTask]:before ${task.source} ${applyArgs}`)
    this.indent++
    const res = parentZoneDelegate.invokeTask(targetZone, task, applyThis, applyArgs)
    this.indent--
    this.log(`[onInvokeTask]:after ${task.source} ${applyArgs}`)
    return res
  }

  onHasTask(delegate: ZoneDelegate, current: Zone, target: Zone, hasTaskState: HasTaskState) {
    const { microTask, macroTask } = hasTaskState
    this.log(`[onHasTask] ${microTask ? 'microTask' : ''} ${macroTask ? 'macroTask' : ''}`)
    return delegate.hasTask(target, hasTaskState)
  }
}

export const logSpec = new LogSpec()