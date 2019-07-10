import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {PIFranService} from '../pifran.service';
import {DataRouteService} from '../data-route.service';
import leaflet from 'leaflet';
import {Events, LoadingController} from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit {
  data: any;
  lat: any;
  lon: any;
  heightMax = 90000;
  map: any;
  imageFilePath: any;
  loading:any;
  @ViewChild('map') mapContainer: ElementRef;
  constructor(public dataManeger: DataRouteService,
              public apiProvider: PIFranService,
              public loadingController: LoadingController,
              public events: Events) {
    events.subscribe('data:recivied', (data, time) => {
      this.loading.dismiss();
    });
    this.loadingController.create({
      message: 'Loading'
    }).then((res) => {
      this.loading = res;
    });
  }

  ngAfterViewInit(){
    const coordinates = this.dataManeger.getCoordinates();
    this.lat = coordinates.lat;
    this.lon = coordinates.lon;
    setTimeout(() => {
      this.startMap(12);
    }, 500);
  }


  doAction() {
    const lat = this.lat;
    const lon = this.lon;
    this.loading.present()
    this.apiProvider.getroutes(lat, lon, [1, 2, 3]).subscribe(
        (data: any) => {
          console.log(data,'data recived');
          this.dataManeger.set_routes(data, lat, lon);
        });
  }


  imageFilePath_change(e) {

  }


  startMap(zoom) {
    let coors=[41.5910, 1.8399];
    if(this.lat != undefined && this.lon != undefined)
      coors=[this.lat, this.lon]
    this.map = leaflet.map('map2').setView(coors, zoom);
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attributions: 'www.tphangout.com',
      maxZoom: 18
    }).addTo(this.map);
    const that = this;
    this.map.on('click', function(e) {
      const coord = e.latlng;
      const z = that.map.getZoom();
      that.lat = coord.lat;
      that.lon = coord.lng;
      that.map.remove();
      that.startMap(z);
    });
    if(this.lat != undefined && this.lon != undefined)
      leaflet.marker([this.lat, this.lon]).addTo(this.map);
  }

}
