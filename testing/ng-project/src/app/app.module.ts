import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { HttpModule } from '@angular/http'
import { BrowserModule } from '@angular/platform-browser'
import { FirebaseRxJSModule } from 'firebase-rxjs-angular'

import { AppComponent } from './app.component'
import { environment } from '../environments/environment'

@NgModule({
  declarations: [
    AppComponent
  ],
  imports:      [
    BrowserModule,
    FormsModule,
    HttpModule,
    FirebaseRxJSModule.primaryApp({
      options: environment.firebase
    })
  ],
  providers:    [],
  bootstrap:    [AppComponent]
})
export class AppModule {
}
