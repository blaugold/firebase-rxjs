/* tslint:disable:no-unused-variable */
import { Observable } from 'rxjs'
import 'rxjs'
import { asyncEvents } from '../testing/jasmine'
import { FirebaseApp } from './app'
import { DataSnapshotObservable } from './data-snapshot-observable'
import { FirebaseDatabase } from './database'

interface DBSchema {
  parent: {
    child: string
  },
  addedChild?: string
  list: {
    [key: string]: {
      c: string
    }
  }
}

let dbFixture: DBSchema = {
  parent: {
    child: 'childValue'
  },
  list:   {
    c: { c: 'c' },
    a: { c: 'a' },
    d: { c: 'd' },
    b: { c: 'b' },
  }
}

let firebaseApp: FirebaseApp
let db: FirebaseDatabase<DBSchema>

describe('Service: FirebaseDatabase', () => {

  beforeAll(() => {
    firebaseApp = new FirebaseApp({ options: firebaseConfig })
    db          = firebaseApp.database<DBSchema>()
  });

  afterAll(asyncEvents(() => {
    firebaseApp.delete().subscribe()
  }))

  beforeEach(asyncEvents(() => {
    db.ref().setWithPriority(dbFixture, 42).subscribe()
  }))

  it('should set node', asyncEvents(() => {
    const ref = db.ref().child('addedChild')

    ref.set('bar')
      .mergeMapTo(ref.onceValue().val())
      .subscribe(val => {
        expect(val).toBe('bar')
      })
  }))

  it('should wrap callbacks to stay in current zone', asyncEvents(() => {
    const zone = Zone.current
    db.ref().child('parent')
      .onceValue()
      .subscribe(() => {
        expect(Zone.current).toBe(zone)
      })
  }))

  it('should update node', asyncEvents(() => {
    const ref = db.ref().child('parent')
    ref.update({ child: 'newValue' })
      .mergeMapTo(ref.onceValue().val())
      .subscribe(node => expect(node).toEqual({ child: 'newValue' }))
  }))

  it('push node', asyncEvents(() => {
    const parent  = db.ref().child('list')
    const newNode = { c: 'c' }

    parent.push(newNode)
      .mergeMap(child => child.onceValue().val())
      .subscribe(node => expect(node).toEqual(newNode))
  }))

  it('listen to updates', asyncEvents(() => {
    const node = db.ref().child('parent').child('child')

    node.onValue().val().bufferCount(2).take(1).subscribe(values => {
      expect(values).toEqual(['a', 'b'])
    })

    Observable.concat(node.set('a'), node.set('b')).subscribe()
  }))

  it('orderByChild', asyncEvents(() => {
    const node = db.ref().child('list')

    node.orderByChild('c')
      .onceValue()
      .toValArray()
      .subscribe(children => expect(children).toEqual([
        { c: 'a' },
        { c: 'b' },
        { c: 'c' },
        { c: 'd' }
      ]))
  }))

  describe('DataSnapshotObservable', () => {
    let snapshotObsFixt: DataSnapshotObservable<DBSchema>

    beforeEach(() => snapshotObsFixt = db.ref().onceValue())

    it('.values()', asyncEvents(() => {
      db.ref().child('parent').onceValue().values().subscribe(values => {
        expect(values).toEqual(['childValue'])
      })
    }))

    it('.keys()', asyncEvents(() => {
      snapshotObsFixt.keys().subscribe(keys => {
        expect(keys).toEqual(['list', 'parent'])
      })
    }))

    it('.list()', asyncEvents(() => {
      db.ref().child('parent').onceValue().list().subscribe(entries => {
        expect(entries).toEqual([{ key: 'child', val: 'childValue' }])
      })
    }))

    it('.entry()', asyncEvents(() => {
      snapshotObsFixt.entry().subscribe(entry => {
        expect(entry).toEqual({ key: null, val: dbFixture })
      })
      snapshotObsFixt.child('parent').entry().subscribe(entry => {
        expect(entry).toEqual({ key: 'parent', val: dbFixture.parent })
      })
    }))

    it('.key()', asyncEvents(() => {
      snapshotObsFixt.child('parent').key().subscribe(entry => {
        expect(entry).toEqual('parent')
      })
    }))

    it('.prevKey()', asyncEvents(() => {
      const initialKeys = Object.keys(dbFixture.list)
      db.ref().child('list').onChildAdded().prevKey().bufferCount(initialKeys.length).take(1)
        .subscribe(prevKey => expect(prevKey).toEqual([null, 'a', 'b', 'c']));
    }))

    it('.exportVal()', asyncEvents(() => {
      snapshotObsFixt.exportVal()
        .subscribe(val => expect(val).toEqual(Object.assign({ '.priority': 42 }, dbFixture)));
    }))

    it('.exists()', asyncEvents(() => {
      snapshotObsFixt.exists()
        .subscribe(exists => expect(exists).toBeTruthy());
    }))

    it('.getPriority()', asyncEvents(() => {
      snapshotObsFixt.getPriority()
        .subscribe(priority => expect(priority).toBe(42));
    }))

    it('.hasChildren()', asyncEvents(() => {
      snapshotObsFixt.hasChildren()
        .subscribe(hasChildren => expect(hasChildren).toBeTruthy());
    }))

    it('.hasChild()', asyncEvents(() => {
      snapshotObsFixt.hasChild('parent')
        .subscribe(hasChild => expect(hasChild).toBeTruthy());
    }))

    it('.numChildren()', asyncEvents(() => {
      snapshotObsFixt.numChildren()
        .subscribe(numChildren => expect(numChildren).toBe(Object.keys(dbFixture).length));
    }))
  })

  it('transaction', asyncEvents(() => {
    db.ref().child('parent').transaction(parent => {
      // TODO investigate why parent is null
      // expect(parent).toBe(dbFixture.parent)
      return { child: 'newValue' }
    }).switchMapTo(db.ref().child('parent').onceValue().val())
      .subscribe(parent => expect(parent.child).toBe('newValue'))
  }))
})
