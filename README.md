# FirebaseRxJS

Firebase with Observables, Type Checking of Schema, Zone.js aware and Angular ready.
 
- Asynchronous results are returned as observables.
- Strings in `.child("pathSegment")` can be validated through static type checking and a schema interface.
- If zone.js is in scope firebase sdk runs in separate zone.
- For use in angular apps `FirebaseRxJSModule` is provided.

TypeScript@2.1.0 and angular@4.0.0 are required.

TypeScript Docs:

- [firebase-rxjs](https://blaugold.github.io/firebase-rxjs/firebase-rxjs/)
- [firebase-rxjs-angular](https://blaugold.github.io/firebase-rxjs/firebase-rxjs-angular/)

```bash
npm install --save firebase-rxjs
# For angular module
npm install --save firebase-rxjs-angular 
```

## Configuration

Create a new `FirebaseApp` by passing in the config from [Firebase Console](https://console.firebase.google.com/).

```typescript
import { FirebaseApp } from 'firebase-rxjs'

const app = new FirebaseApp({ options: {
    apiKey: "...",
    authDomain: "...",
    databaseURL: "...",
    storageBucket: "...",
    messagingSenderId: "..."
}});

// Get a reference to `FirebaseAuth`
const auth = app.auth()

auth.createUserWithEmailAndPassword("...", "...").subscribe(user => {
  ...
})
```

## Usage

To get static type checking when accessing the database define a database schema interface.
Its best to compose the schema out of smaller interfaces. This keeps your schema clear and
allows you to easily access subsections with `db.ref<SubSchema>('path/to/something')`.

```typescript
// database-schema.ts
export interface UserProfile {
  firstName: string
  lastName: string
  twitter: string
  profileImg: string
}

export interface Comment {
  text: string
  createdAt: number
  author: string
  authorId: string
}

export interface Comments {
  [commentId: string]: Comment
}

export interface BlogPost {
  title: string
  summary: string
  body: string
  author: string
  authorId: string
  publishedAt: number
  updatedAt: number
  comments: Comments
}

export interface DBSchema {
  users: {
    [userId: string]: UserProfile
  }
  blogPosts: {
    [postId: string]: BlogPost
  }
}
```

Now when getting a reference of the database use the schema interface as the type parameter.

```typescript
import { FirebaseApp } from 'firebase-rxjs'
import { DBSchema } from './database-schema.ts'

const app: FirebaseApp
const db = app.database<DBSchema>()

// Now the compiler will yell at you if you use the wrong path segments.
db.ref().child('userz')

// Or if you go deeper in the tree pass a sub schema as the type parameter.
const commentsRef = db.ref<Comments>('blogPosts/1/comments')

// Using a schema will also give you better IntelliSense when accessing the retrieved data.
commentsRef.onValue().list().subscribe(comments  => {
  comments[0].key
  comments[0].val.body
})
```

The result of onValue, onChildAdded, etc is a `DataSnapshotObservable<T>` which is typed 
according to the previous calls and the schema. It provides some helpful methods to make working
with `DataSnapshots` easier, but the snapshots can be accessed directly too. 

Most methods overall mirror the firebase sdk and behave the same.

## Angular

Include the `FirebaseRxJSModule` in your root module. It is possible to provide multiple apps for
injection but only one primary app. The primary `FirebaseApp` will make itself, `FirebaseAuth` and
`FirebaseDatabase` injectable directly. Secondary apps have to be configured with an 
`InjectionToken` which will inject the `FirebaseApp`. 

```typescript
import { NgModule, InjectionToken } from '@angular/core'
import { FirebaseRxJSModule, FirebaseApp } from 'firebase-rxjs-angular'

const secondaryApp = new InjectionToken<FirebaseApp>()

@NgModule({
  ...
  imports: [
    FirebaseRxJSModule.primaryApp({options: ... }),
    FirebaseRxJSModule.secondaryApp(secondaryApp, {options: ... }),
  ],
  ...
})
export class AppModule {}
```

## Zone.js

If `Zone` is globally available all calls to the firebase sdk will run in an isolated zone, forked 
from the root zone. Alternatively a zone can be passed to the `FirebaseApp` constructor. All other 
methods take the zone of their call site and schedule tasks with it. 

Motivation for this feature is a problem which lets all protractor tests timeout unless synchronization is 
turned off. The cause lies in how protractor determines when changes stemming from the last input 
have propagated and the next instruction or expectation can be executed. It does this by observing
whether or not MicroTasks and MacroTasks are scheduled to run. Once the queues of theses tasks are 
empty it's safe to assume the dom wont change. EventTasks like listeners on `WebSocket.onmessage` 
could run and change the dom but that is unpredictable and can not be factored in to the decision
when to proceed with the test. Now what if micro and macro tasks schedule new tasks themselves? 
Protractor again will wait until all tasks have run. And this is what is problematic. When using 
the database the firebase sdk sends a heartbeat by setting up a timeout which first sends the 
heartbeat and then reschedules the next timeout. The result is a recursive chain of never ending 
MacroTasks keeping the task queue dirty. Independently of that the firebase sdk sets up a long 
running (around 30 seconds) timeout during initialization timing out any test by itself. 

## Real Time

Its worth noting that all write operations and one off reads are scheduled as MacroTasks, 
meaning protractor or angular's `async` test helper will wait until these tasks have run. This is not 
true for observables returned from `.{on}{Value,ChildAdded,ChildRemove,ChildChanged,ChildMoved}()`.
The semantics of MacroTasks are that they are
<blockquote>guaranteed to execute at least once after some well understood delay.</blockquote>
For a real time databases like Firebase the correct tasks to use is the EventTask. This type of task
is expected to run zero or multiple times with unpredictable timing. So when using the methods 
starting with `on`, tests relying on zone.js will not wait for them to complete, unless the framework
is configured to wait for all EventTasks to be canceled. For each observable
which emits real time database events the library schedules an EventTask on subscription and cancels 
it when the observable is unsubscribed. To make testing these kinds of observables simpler a test helper for
the jasmine testing framework is included:

```typescript
import { asyncEvents } from 'firebase-rxjs'

describe('Suite', () => {
  it('should wait for EventTasks to clear', asyncEvents(async () => {
    const db: FirebaseDatabase<any>
    // This observable will unsubscribe itself after emitting 3 events.
    db.ref().child('foo').onValue().take(3).subscribe()
    
    // Multiple observables or other asynchronous tasks will block the test until their 
    // resolution too.
    const res = await fetch('https://www.google.com')
  }))
})
```

End-to-end tests should poll content on the page under test, which is dependent on real time changes,  
until a expected state is reached or timeout. 

