import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import {HttpClientModule} from '@angular/common/http';
import { AppComponent } from './app.component';
import { UploadComponent } from './upload/upload.component';
import { Upload4Component } from './upload4/upload4.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
//import {MdRadioModule, MdProgressBarModule, MdButtonModule, MdInputModule} from '@angular/material';


@NgModule({
  declarations: [
    AppComponent,
    UploadComponent,
    Upload4Component
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    HttpClientModule, BrowserAnimationsModule],
    //HttpClientModule, BrowserAnimationsModule, MdRadioModule, MdProgressBarModule, MdButtonModule, MdInputModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
