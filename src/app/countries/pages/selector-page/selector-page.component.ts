import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { filter, switchMap, tap } from 'rxjs';

import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry } from '../../interfaces/country.interfaces';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: ``
})
export class SelectorPageComponent implements OnInit {

  public countriesByRegion: SmallCountry[] = [];
  public borders: SmallCountry[] =[];

  public myForm: FormGroup = this.formBuilder.group({
    region:  ['', Validators.required ],
    country: ['', Validators.required ],
    border:  ['', Validators.required ]
  });

  constructor( private formBuilder: FormBuilder,
    private countriesService: CountriesService
   ) {}

  ngOnInit(): void {
    this.onRegionChanged();
    this.onCountryChanged();
  }

  get regions(): Region[] {
    return this.countriesService.regions;
  }

  // Método utilizado para registrar los cambios de región
  onRegionChanged(): void {
    this.myForm.get( 'region' )!.valueChanges
      .pipe(
        tap( () => this.myForm.get('country')!.setValue('') ),
        tap( () => this.borders = [] ),
        // El switchMap permite recibir el valor de un observable y suscribirse a otro observable
        switchMap( region => this.countriesService.getCountriesByRegion( region ) )
      )
      .subscribe( countries => {
        this.countriesByRegion = countries.sort( (a, b) => a.name.localeCompare(b.name));
      });
  }

  // Método utilizado para registrar los cambios de país
  onCountryChanged(): void {
    this.myForm.get( 'country' )!.valueChanges
    .pipe(
      tap( () => this.myForm.get('border')!.setValue('') ),
      filter( (value: string) => value.length > 0 ),
      // El switchMap permite recibir el valor de un observable y suscribirse a otro observable
      switchMap( alphaCode => this.countriesService.getCountryByAlphaCode( alphaCode ) ),
      switchMap( country => this.countriesService.getCountryBordersByCodes( country.borders ) )
    )
    .subscribe( countries => {
      this.borders = countries;
    });
  }

}
