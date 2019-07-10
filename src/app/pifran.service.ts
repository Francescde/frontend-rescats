import { Injectable } from '@angular/core';
import { HTTP} from '@ionic-native/http/ngx';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PIFranService {


  constructor(private http: HttpClient) {}
  apiPath = 'http://127.0.0.1:5000';

  getroutes(lat, lon, vehicles) {
    // 41.61449710003&lon=1.84747999968
    if (vehicles.length > 0) {
      let vehiclesStr = '';
      for (let i = 0; i < vehicles.length; ++i) {
        if (i > 0) {
          vehiclesStr += ',';
        }
        vehiclesStr += vehicles[i];
      }
      return this.http.get(this.apiPath + '/calculateRoute?lat=' + lat + '&lon=' + lon + '&vehicles=' + vehiclesStr);
    } else {
      return this.http.get(this.apiPath + /calculateRoute?lat=' + lat + '&lon=' + lon);
    }
    /*
    this.http.get('http://127.0.0.1:5000/', {}, {})
        .then(data => {

          console.log(data.status);
          console.log(data.data); // data received by server
          console.log(data.headers);

        });*/
  }

}
