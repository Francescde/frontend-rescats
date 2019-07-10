import { Injectable } from '@angular/core';
import {Events} from '@ionic/angular';
import {PIFranService} from './pifran.service';

@Injectable({
  providedIn: 'root'
})
export class DataRouteService {
  private vehicleNames = ['car', 'BRP', '4x4'];
  private data: any;
  private coordinates = {
    lat: undefined,
    lon: undefined
  };
  private displayRoutes = {
    routeName: undefined,
    route: undefined,
    subroutes: undefined
  };
  constructor(public events: Events) {}

  get_routes() {
    return this.displayRoutes;
  }

  set_routes(data: any, lat, lon) {
    this.data = data;
    this.coordinates.lat = lat;
    this.coordinates.lon = lon;
    this.events.publish('data:recivied', data, Date.now());
  }

  calculaRuta(point, subroutes) {
    // calcul de la part multimodal
    // punt de tall
    console.log(this.data, 'show');
    console.log(point)
    const changePoint = this.data.multimodal[point].changePoint;
    this.displayRoutes.route = [];
    for (let it = changePoint; it < this.data.multimodal[point].points.length; ++it) {
      this.displayRoutes.route.push(this.data.multimodal[point].points[it]);
    }
    // displayRoutes com a route te la part des del MeetPoint
    this.displayRoutes.routeName = point;
    this.displayRoutes.subroutes = [];
    for ( const subrute in subroutes) {
      const subroteName = subroutes[subrute].route + '_' + this.vehicleNames[subroutes[subrute].vehicle - 1];
      const subruteObj = this.data.subroutes[point][subroteName];
      subruteObj.vehicle = subroutes[subrute].vehicle;
      this.displayRoutes.subroutes.push({
        subroute: subruteObj,
        subrouteName: subroutes[subrute].route,
        vehicle: this.vehicleNames[subroutes[subrute].vehicle - 1]
      });
    }
    this.displayRoutes.subroutes.sort(function(a, b) {
      return b.subroute.points[0].cost - a.subroute.points[0].cost;
    });
    this.events.publish('data:calculated', this.displayRoutes, Date.now());
  }

  getCoordinationPointData() {
      return this.data.meetPoints;
  }

  getCoordinates() {
    return this.coordinates;
  }
}
