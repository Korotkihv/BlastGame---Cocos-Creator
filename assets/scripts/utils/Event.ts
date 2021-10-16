export class EventHandler {
    owner = null
    isComponent = false
    constructor(owner, onEvent, public once = false) {
        this.owner = owner
        this.cbOnEvent = onEvent
        this.isComponent = owner instanceof cc.Component
    }
    onEvent(args?) { this.cbOnEvent(args) }
    cbOnEvent = null
}

export class Event<T = any> {
    handlers: EventHandler[] = new Array()
    add(handler: EventHandler)
    add(owner: cc.Component, cb: (t: T) => void, msg?)
    add(owner: any, cb: (t: T) => void, msg?)
    add(owner, cb?, msg?) {
        let handler = owner instanceof EventHandler ? owner: new EventHandler(owner, cb)
        if (owner instanceof cc.Component) {
            let subscribedEvents: Set<Event> = owner['__etr']
            if (subscribedEvents == undefined) {
                owner['__etr'] = new Set<Event>([this])
                let old = owner['onDestroy']
                owner['onDestroy'] = () => { 
                    let events: Set<Event> = owner['__etr']
                    events.forEach(ev => ev.removeAll(owner))
                    if (owner.isValid && old) old.call(owner)
                }    
            } else {
                subscribedEvents.add(this)
            }
        } 
        this.handlers.push(handler)
    }
    replace(owner, cb: (t: T) => void) { 
        this.removeAll(owner)
        this.add(owner, cb)
    }
    dispatch(args?: T) {
        this.handlers.filter(h => {
            if (!h.isComponent) return true
            return h.owner.node != undefined && h.owner.node.isValid
        })
        this.handlers.forEach(h => h.onEvent(args)) 
        this.handlers = this.handlers.filter(h => h.once == false)
        return true
    }
    remove(handler: EventHandler) { this.handlers = this.handlers.filter(h => h != handler) }
    removeAll(owner?) { 
        if (owner) this.handlers = this.handlers.filter(h => h.owner != owner) 
        else this.handlers = []
    }
    once(cb) {
        let h = new EventHandler(this, a => { this.remove(h); cb(a) })
        this.add(h)
    }
    static once(e: Event, cb: (a) => void) {
        let h = new EventHandler(this, a => { e.remove(h); cb(a) })
        e.add(h)
    }
}

