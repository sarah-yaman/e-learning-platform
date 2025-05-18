import { Component, OnInit } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import { CardComponent } from '../../_component/card/card.component';
import { HttpClient } from '@angular/common/http';
import { CloudService } from '../../../services/cloud.service';
import { Course } from '../../../model/courses.model'

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatCardModule, CardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  longText = `The Shiba Inu is the smallest of the six original and distinct spitz breeds of dog
  from Japan. A small, agile dog that copes very well with mountainous terrain, the Shiba Inu was
  originally bred for hunting.`;

  constructor(private cloudSer: CloudService){

  }

  courses: Course[]=[];

  ngOnInit(): void {
    this.cloudSer.getCourses().subscribe({
      next:(res:any)=>{
        console.log("COURSES", res.data)
        this.courses = res.data;
      },
      error:(e)=>{
        console.log("Error in Fetching Data",e)
      }
    })
  }

  addToCart(){
    console.log("ID")
  }

}
