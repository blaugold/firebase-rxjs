import 'rxjs/add/operator/map'
import { FirebaseApp } from '../'

/**
 * This example demonstrates the type checking ability when the database is used with a schema.
 * Open this file with an ide like VS Code or WebStorm and you should see error highlighting.
 */

interface DBSchema {
  todoLists: {
    [listId: string]: {
      name: string
      todoItems: {
        [itemId: string]: {
          title: string
          checked: boolean
        }
      }
    }
  }
}

let app = new FirebaseApp({ options: {} } as any)
let db  = app.database<DBSchema>()

// Should compile.
db.ref().child('todoLists').child('1').child('todoItems')

db.ref().child('todoLists').child('1').child('name').onValue().val()
  .map((name: string /* Compiles since `name`has type string. */) => {})

db.ref().child('todoLists')
  .orderByChild('name').startAt('A')
  .onChildChanged().val()
  .map(c => c.name)

// Should not compile.
db.ref().child('todoLists').child('1').child('todoItemz') // todoItemz should be todoItems.

db.ref().child('todoLists').child('1').child('name').onValue().val()
  .map((name: number /* Fails since `name` has type string. */) => {})