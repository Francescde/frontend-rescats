import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Events, LoadingController} from '@ionic/angular';
import leaflet from 'leaflet';
import {DataRouteService} from '../data-route.service';

@Component({
  selector: 'app-list',
  templateUrl: 'list.page.html',
  styleUrls: ['list.page.scss']
})
export class ListPage  {
  @ViewChild('map2') mapContainer: ElementRef;

  colors = ['blue', 'orange', 'red', 'green', 'pink', 'yellow', 'black'];
  map: any;
  routes: any;
  vehicles: any;
  lat: number;
  lon: number;
  started = false;
  show = true;
  hideText = 'hide';
  routeName: string;
  routeInfo = {
    cost: 0,
    origen: undefined,
    costs: {
      '4x4': 0,
      BRP: 0,
      car: 0,
      walk: 0
    },
    color: 'blue',
    dist: 0,
    negRamp: 0,
    posRamp: 0,
    vehicle: ''
  };
  routeInfos = [];

  vehiclesIcons = [ leaflet.icon({
    iconUrl: 'http://maps.google.com/mapfiles/kml/shapes/man.png',

    iconSize:     [38, 38], // size of the icon
    iconAnchor:   [22, 37], // point of the icon which will correspond to marker's location
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
  }), leaflet.icon({
    iconUrl: 'https://www.google.com/url?sa=i&source=images&cd=&ved=2ahUKEwin6ruX_cziAhVRVhoKHQTZAOQQjRx6BAgBEAU&url=http%3A%2F%2Fwww.iconarchive.com%2Fshow%2Fandroid-icons-by-icons8%2FHealthcare-Ambulance-icon.html&psig=AOvVaw2Bx09QuvZWhjQEG_-BPCUy&ust=1559639798403011',
    iconSize:     [38, 95], // size of the icon
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
  }), leaflet.icon({
    iconUrl: 'http://maps.google.com/mapfiles/kml/shapes/truck.png',

    iconSize:     [38, 38], // size of the icon
    iconAnchor:   [22, 37], // point of the icon which will correspond to marker's location
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
  }), leaflet.icon({
    iconUrl: 'http://maps.google.com/mapfiles/kml/shapes/cabs.png',

    iconSize:     [38, 38], // size of the icon
    iconAnchor:   [22, 37], // point of the icon which will correspond to marker's location
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
  })
  ]


  padTime(t) {
    return t < 10 ? '0' + t : t;
  }

  secondsToTime(_seconds) {
    if (typeof _seconds !== 'number' || _seconds < 0) {
      return _seconds;
    }

    const hours = Math.floor(_seconds / 3600),
        minutes = Math.floor((_seconds % 3600) / 60),
        seconds = Math.floor(_seconds % 60);

    return this.padTime(hours) + ':' + this.padTime(minutes) + ':' + this.padTime(seconds);
  }

  round2(num) {
    return Math.round(num * 100) / 100;
  }

  hideFooter() {
    this.show = !this.show;
    this.hideText = 'hide';
    if (!this.show) {
      this.hideText = 'show';
    }
  }

  constructor(public loadingController: LoadingController,
              public dataManeger: DataRouteService,
              public events: Events) {
    this.vehicles = [1, 2, 3];
    const coordinates = this.dataManeger.getCoordinates();
    this.lat = coordinates.lat;
    this.lon = coordinates.lon;
    this.routes = this.dataManeger.get_routes();
    this.routeName = this.routes.routeName;
    let that=this;
    events.subscribe('data:calculated', (data, time) => {
      if (this.started) {
        that.map.remove();
        that.printAllMap();
      }
    });
    events.subscribe('mark', (title, time) => {
      let nodesTOShow=[];
      for (let p of this.routeInfos) {
          if (p.origen == title.title) {
              if(title.vehicle!=undefined) {
                if (title.do && p.vehicle == title.vehicle) {
                  console.log('entra');
                  p.marked = title.do;
                  for (const objKey in p.obj) {
                    p.obj[objKey].setStyle({weight: 20});
                    nodesTOShow.push(p.obj[objKey]);
                  }
                } else {
                  p.marked=false;
                  if(p.obj[0].options.weight!=8) {
                    for (const objKey in p.obj) {
                      p.obj[objKey].setStyle({weight: 8});
                    }
                  }
                }
              }
              else {
                p.marked = title.do;
                if(p.marked){
                  for (const objKey in p.obj) {
                    nodesTOShow.push(p.obj[objKey]);
                    p.obj[objKey].setStyle({weight: 20});
                  }
                  nodesTOShow.concat(p.obj);
                }
                else{
                  if(p.obj[0].options.weight!=8) {
                    for (const objKey in p.obj) {
                      p.obj[objKey].setStyle({weight: 8});
                    }
                  }
                }
              }
          }
          else {
            p.marked = false;
            for (const objKey in p.obj) {
              p.obj[objKey].setStyle({weight: 8});
            }
          }
        }
      console.log(nodesTOShow);
      let group = new leaflet.featureGroup(nodesTOShow);
      this.map.fitBounds(group.getBounds());
    });
  }


  calculateValues(subroute) {
    const obj = {
      cost: subroute[1].cost,
      origen: undefined,
      costs: {
          '4x4': 0,
          BRP: 0,
          car: 0,
          walk: 0
      },
      color: 'blue',
      dist: 0,
      negRamp: 0,
      posRamp: 0,
      vehicle: subroute[1].vehicle
    };
    for (let i = 1; i < subroute.length; ++i) {
      if (subroute[i].costs['4x4'] < 9999) {
        obj.costs['4x4'] += subroute[i].costs['4x4'];
      }
      if (subroute[i].costs.car < 9999) {
        obj.costs.car += subroute[i].costs.car;
      }
      if (subroute[i].costs.BRP < 9999) {
        obj.costs.BRP += subroute[i].costs.BRP;
      }
      if (subroute[i].costs.walk < 9999) {
        obj.costs.walk += subroute[i].costs.walk;
      }
      obj.dist += subroute[i].dist;
      obj.negRamp += subroute[i].negRamp;
      obj.posRamp += subroute[i].posRamp;
    }
    return obj;
  }

  printAllMap() {
    this.startMap( this.lat, this.lon);
    this.printRoute(this.routes.route, 0);
    this.routeInfos = [];
    this.routeInfo = this.calculateValues(this.routes.route);
    for ( let sub= this.routes.subroutes.length - 1; sub >= 0; --sub ) {
      const obj = this.printRoute(this.routes.subroutes[sub].subroute.points, this.routes.subroutes[sub].subroute.vehicle);
      this.routeInfos.push(this.calculateValues(this.routes.subroutes[sub].subroute.points));
      this.routeInfos[this.routeInfos.length - 1].color = this.colors[this.routes.subroutes[sub].subroute.vehicle];
      this.routeInfos[this.routeInfos.length - 1].origen = this.routes.subroutes[sub].subrouteName;
      this.routeInfos[this.routeInfos.length - 1].obj = obj;
      this.routeInfos[this.routeInfos.length - 1].marked = false;
    }
  }

  senyala(route) {
    let change = true;
    if (route.obj[0].options.weight == 20) {
      change = false;
    }
    let marked=change;
    for (let p of this.routeInfos) {
      if (p.marked)
        marked = true;
    }
    this.events.publish('mark', {title:route.origen,do:change,vehicle:route.vehicle,marked:marked}, Date.now());
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.printAllMap();
    }, 500);
  }


  startMap(lat, lon) {
    this.started = true;
    this.map = leaflet.map('map').setView([41.5910, 1.8399], 12);
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attributions: 'www.tphangout.com',
      maxZoom: 18
    }).addTo(this.map);
    leaflet.marker([lat, lon]).addTo(this.map);
    // pintem bases
    const bases = [{
      coordinates: [41.7410791, 1.849642],
      name: 'Manresa',
      type: -1
    }, {
      coordinates: [41.4987656, 1.9079489],
      name: 'Martorell',
      type: -1
    }, {
      coordinates: [41.5891303, 1.6078417],
      name: 'Igualada',
      type: -1
    }, {
      coordinates: [41.5687856, 1.8242247],
      name: 'Collbato',
      type: -1
    }, {
      coordinates: [41.6656828, 1.6830365],
      name: 'Castellfollit del Boix',
      type: -1
    }, {
      coordinates: [41.5619597, 1.9614527],
      name: 'Viladecavalls',
      type: -1
    }];
    for(const baseKey in bases){
      let circle = leaflet.circle(bases[baseKey].coordinates, {
        color: 'blue',
        fillColor: 'blue',
        fillOpacity: 0.3,
        radius: 200
      });
      this.map.addLayer(circle);
    }
  }



  printRoute(points, colorSel) {
    const pointList = [];
    let walking = false;
    let lastPoint;
    let i = 0;
    for ( const point of points) {
      const newPoint = new leaflet.LatLng(point.coordinates[0], point.coordinates[1]);
      if (i == 0) {
        leaflet.marker([point.coordinates[0], point.coordinates[1]], {icon: this.vehiclesIcons[colorSel]}).addTo(this.map);
        lastPoint = point;
        ++i;
      }
      if (point.vehicle == 'walk' && !walking) {
        walking = true;
        /*let circle = leaflet.circle([lastPoint.coordinates[0], lastPoint.coordinates[1]], {
          color: colors[colorSel],
          fillColor: colors[colorSel],
          fillOpacity: 0.3,
          radius: 200
        });
        that.map.addLayer(circle);*/
      }
      let dasharray = '0, 10';
      if (point.vehicle == 'car') {
        dasharray = '';
      }
      if (point.vehicle == '4x4') {
        dasharray = '7, 10';
      }
      if (point.vehicle == 'BRP') {
        dasharray = '10, 7';
      }
      const firstpolyline = new leaflet.Polyline([[lastPoint.coordinates[0], lastPoint.coordinates[1]], [point.coordinates[0], point.coordinates[1]]], {
        color: this.colors[colorSel],
        weight: 8,
        opacity: 1,
        dashArray: dasharray,
        smoothFactor: 1

      });
      this.map.addLayer(firstpolyline);
      lastPoint = point;
      pointList.push(firstpolyline);
    }
    return pointList;
  }
}
