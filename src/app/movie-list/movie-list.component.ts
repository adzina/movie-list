import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { FormControl } from '@angular/forms';

import { PagerService } from '../services/pager.service';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/debounceTime';

@Component({
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.css']
})
export class MovieListComponent implements OnInit {

  constructor(private http: HttpClient,
              private pagerService: PagerService) { }
  fields: any[];              //holds metadata
  values: any[];              //holds all the data
  filteredValues: any[];      //holds filtered data
  pagedValues: any[] = [];    //holds data shown at current page
  tags: any[] = [];           //holds names of data columns
  currentFilter: any = ""; //holds tag by which user filters the values
  filters: any[] = [];       //holds all filters used by the user
  pager: any = {};
  search = new FormControl();
  formCtrlSub: Subscription;
  sortedBy:string = "";       //holds the name of the column used to sort the values
  previousSearch:string = "";//helps to determine how user changed filter query
  ngOnInit() {

    this.formCtrlSub = this.search.valueChanges
      .debounceTime(500)
      .subscribe(newSearch => this.onSearchChange(newSearch));

    //get data from the API
    this.http.get("https://api.myjson.com/bins/1tll6").subscribe(result => {

      this.fields = result["fields"];
      this.values = result["values"];
      this.filteredValues = result["values"];
      for(let i of this.fields){
        this.tags.push(i["field"]);
      }
      //replace all empty fields with empty string (will come in handy when sorting)
      for(let value of this.values){
        for(let tag of this.tags){
          if(value[tag]==null){
            value[tag] = "";
          }
        }
      }

      this.setPage(1);
    }, error => console.error(error));
  }

  //sort values by a specific field
  sortBy(field:any){
  this.filteredValues.sort(function(a, b){
     if ( a[field.field] !="" && a[field.field] < b[field.field] )
          return -1;
     if ( b[field.field] != "" && a[field.field] > b[field.field])
          return 1;
     if (a[field.field] != "" && b[field.field]=="")
          return -1;
     if (a[field.field] == "" && b[field.field]!="")
          return 0;
        });
    this.sortedBy = field;

    this.setPage(this.pager.currentPage);
  }
  setPage(page: number) {
    if (page < 1) {
      return;
    }
    // get pager object from service
    this.pager = this.pagerService.getPager(this.filteredValues.length, page);
    // get current page of items
    this.pagedValues = this.filteredValues.slice(this.pager.startIndex,this.pager.endIndex + 1);
  }
  setFilter(filter: any){
    this.currentFilter = filter;
  }
  removeFilter(filter: any){
    let index = this.filters.findIndex(f => f.filed === this.currentFilter.field);
    this.filters.splice(index, 1);
    this.filteredValues = this.values;
    this.filterByAllFilters();

  }
  filterByAllFilters(){
    for(let filter of this.filters){
      if(filter.type=="text"){
        this.filteredValues = this.filteredValues.filter(value => value[filter.field].toLowerCase().includes(filter.query.toLowerCase()));
      }
      else if(filter.type=="number"){
        this.filteredValues = this.filteredValues.filter(value => value[filter.field] < filter.query));
      }
    }
    this.sortBy(this.sortedBy);
    this.setPage(1);
  }
  onSearchChange(searchValue: string) {
    //execute filtering only if a filter is chosen
    if(this.currentFilter==null)
      return;

    let found = false;
    for(let filter of this.filters){
      if(filter == this.currentFilter){
        filter.query = searchValue;
        found = true;
      }
    }
    if(!found){
      this.currentFilter.query = searchValue;
      this.filters.push(this.currentFilter);
    }
    //if user changed the query in other way than aading a letter at the end
    if(!searchValue.includes(this.previousSearch) && this.previousSearch!=""){
      //bring back the old values and use all filters again
      this.filteredValues = this.values;
      this.filterByAllFilters();
      this.previousSearch = searchValue;
      return;
    }
    //filter the values
    if(this.currentFilter.type=="text"){
      this.filteredValues = this.filteredValues.filter(value => value[this.currentFilter.field].toLowerCase().includes(searchValue.toLowerCase()));
    }
    else if(this.currentFilter.type=="number"){
      this.filteredValues = this.filteredValues.filter(value => value[this.currentFilter.field] < searchValue));
    }
    else{
      //here you can define
      //the way you want the values filtered
      //if data is of any other type than number or text
    }
    this.previousSearch = searchValue;
    this.setPage(1);
    }

  ngOnDestroy() {
    this.formCtrlSub.unsubscribe();
  }

}
