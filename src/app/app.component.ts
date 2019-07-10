import { Component } from '@angular/core';

import {Events, Platform, NavController} from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import {DataRouteService} from './data-route.service';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  public vehicleType = ['Car', 'BRP', '4x4'];

  public appPages = [
    {
      title: 'Home',
      url: '/home',
      icon: 'build',
      pos: 0,
      show: false,
      accseses: undefined,
      vehicles: undefined
    }
  ];

  foundPos(data, name) {
    let pos=-1;
    let i=0;
    for (const d in data) {
      if (data[d].subrouteName == name) {
        pos=i;
      }
      ++i;
    }
    return pos;
  }

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public dataManeger: DataRouteService,
    public events: Events,
    public navCtrl: NavController
  ) {
    this.initializeApp();
    const that = this;
    events.subscribe('data:calculated', (data, time) => {
      for (const p of this.appPages) {
        if (p.show) {
          if (p.accseses != undefined) {
            p.accseses.sort(function(a, b) {
              return that.foundPos(data.subroutes, b.title) - that.foundPos(data.subroutes, a.title);
            });
          }
        }
      }
    });
    events.subscribe('mark', (title, time) => {
      if(title.marked!=undefined)
        title.do=title.marked;
      for (const p of this.appPages) {
        if (p.show) {
          for (const sp of p.accseses) {
            if (sp.title == title.title) {
                sp.marked = title.do;
            }
            else {
              sp.marked = false;
            }
          }
        }
      }
    });
    events.subscribe('data:recivied', (data, time) => {
        const pointData = that.dataManeger.getCoordinationPointData();
        that.appPages = [that.appPages[0]];
        let position = 1;
        for (const p in pointData) {
          const accsesesAll = {};
          for (const sp in pointData[p].points) {
             if (accsesesAll[pointData[p].points[sp].route] == undefined) {
               accsesesAll[pointData[p].points[sp].route] = [pointData[p].points[sp].vehicle];
             } else {
               accsesesAll[pointData[p].points[sp].route].push(pointData[p].points[sp].vehicle);
             }
          }
          const accsesesArr = [];
          for ( const key in accsesesAll) {
            const vehiclesArr = [];
            for (const v in accsesesAll[key]) {
              vehiclesArr.push({
                selected: true,
                id: parseInt(accsesesAll[key][v])
              });
            }
            accsesesArr.push({
              title: key,
              icon: 'map',
              vehicles: vehiclesArr,
              marked: false
            });
          }
          const vehiclesALL = [];
          for (const v in pointData[p].vehicles) {
            vehiclesALL.push({
              selected: true,
              id: pointData[p].vehicles[v]
            });
          }
          that.appPages.push({
            title: p,
            url: '/list/' + p,
            icon: 'map',
            accseses: accsesesArr,
            pos: position,
            show: false,
            vehicles: vehiclesALL,
          });
          ++position;
        }
      // user and time are the same arguments passed in `events.publish(user, time)`
    });
    // navCtrl.;
  }



  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  changeAll(p, id, sel): void {
    for (const sp of p.accseses) {
      for (const v of sp.vehicles) {
        if (v.id == id ) {
          v.selected = sel;
        }
      }
    }
    this.checkChanges(p,{});
  }

  checkChanges(p, ssp) {
    const points = [];
    for (const sp of p.accseses) {
      for (const v of sp.vehicles) {
        if (v.selected ) {
          const routeVehicle = {
            route: sp.title,
            vehicle: v.id
          };
          points.push(routeVehicle);
        }
      }
    }
    this.dataManeger.calculaRuta(p.title, points);
    let marked=false;
    if(ssp.vehicles != undefined) {
      for (let vei of ssp.vehicles){
        if(vei.selected)
          marked=true;
      }
    }
    if(!marked)
      this.events.publish('mark', {title:ssp.title,do:marked}, Date.now());
  }

  menuItemHandler(num): void {
    for (const p of this.appPages) {
      p.show = false;
    }
    this.appPages[num].show = true;
    if (num > 0) {
      this.checkChanges(this.appPages[num],{});
    }

  }

  markByTitle(ssp){
    let marked=false;
    for (let vei of ssp.vehicles){
      if(vei.selected)
        marked=true;
    }
    this.events.publish('mark', {title:ssp.title,do:marked}, Date.now());
  }
}
