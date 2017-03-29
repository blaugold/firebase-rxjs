import { Component, OnInit } from '@angular/core';
import { FirebaseDatabase } from 'firebase-rxjs'
import { Observable } from 'rxjs'

interface DBSchema {
  title: string
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title: Observable<string>;

  constructor(private db: FirebaseDatabase<DBSchema>) {}

  ngOnInit(): void {
    const titleRef = this.db.ref().child('title')

    this.title = Observable.of('app works!')
      .merge(titleRef.set('with Firebase!')
        .switchMapTo(titleRef.onValue().val()))
  }
}

