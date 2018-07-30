import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule,ReactiveFormsModule} from '@angular/forms';


import { AppComponent } from './app.component';
import { MovieListComponent } from './movie-list/movie-list.component';
import { PagerService } from './services/pager.service';

const routes: Routes = [
  {
    path: '',
    component: MovieListComponent
  }
];
@NgModule({
  declarations: [
    AppComponent,
    MovieListComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [PagerService],
  bootstrap: [AppComponent]
})
export class AppModule { }
