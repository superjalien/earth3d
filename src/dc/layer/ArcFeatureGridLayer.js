import CustomFeatureGridLayer from "./CustomFeatureGridLayer";
import { esri } from "leaflet";
/*
 * @Description: ArcGIS矢量服务分块加载图层
 * @version: 
 * @Author: 宁四凯
 * @Date: 2020-08-20 16:53:37
 * @LastEditors: 宁四凯
 * @LastEditTime: 2020-08-21 08:56:01
 */
class ArcFeatureGridLayer extends CustomFeatureGridLayer{
  constructor(cfg, viewer) {
    super(cfg, viewer);
  }

  // 获取网格内的数据，callback为回调方法，参数传数据数组
  getDataForGrid(opts, callback) {
    let that = this;
    let url = this.config.url;
    if (this.config.layers && this.config.layers.length > 0) {
      url += "/" + this.config.layers[0];
    }

    let query = esri.query({
      url: url
    });

    // 网格
    let bounds = L.latLngBounds(L.latLng(opts.rectangle.ymin, opts.rectangle.xmin),
      L.latLng(opts.rectangle.ymax, opts.rectangle.xmax));

    query.within(bounds);
    
    if (this.config.where) {
      query.where(this.config.where);
    }

    query.run((error, featureCollection, response) => {
      if (!that._visible || !that._cacheGrid[opts.key]) {
        return; // 异步请求结束时，如果已经卸载了网格，就直接退出
      }

      if (error != null && error.code > 0) {
        console.log('arcgis服务访问出错' + error.message);
        return;
      }

      if (featureCollection == undefined || featureCollection == null) {
        return; // 数据为空
      }

      if (featureCollection.type == 'Feature') {
        featureCollection = {
          "type": "FeatureCollection",
          "features": [featureCollection]
        };

        callback(featureCollection.features);
      }

    });

  }

  // 根据数据创造entity
  createEntity(opts, item, callback) {
    let that = this;
    let dataSource = Cesium.GeoJsonDataSource.load(item, {
      clampToGround: true
    });

    dataSource.then((dataSource) => {
      if (that.checkHasBreak[opts.key]) {
        return; // 异步请求结束时，如果已经卸载了网格就直接跳出。
      }

      if (dataSource.entities.values.length == 0) {
        return null;
      }

      let entity = dataSource.entities.values[0];
      entity._id = that.config.id + "_" + opts.key + "_" + entity.id;

      that._addEntity(entity, callback);
    }).otherwise((error) => {
      that.showError("服务出错", error);
    });

    return null;
  }

  _addEntity(entity, callback) {
    let that = this;
    // 样式
    let symbol = this.config.symbol;
    if (typeof symbol === 'function') {
      symbol(entity, entity.properties); // 回调方法
    } else if (symbol == 'default') {
      this.setDefSymbol(entity);
    } else {
      this.setConfigSymbol(entity, symbol);
    }

    // popup弹窗
    if (this.config.columns || this.config.popup) {
      entity.popup = {
        html: function(entity) {
          return that.viewer.mars.popup.getPopupForConfig(that.config, entity.properties);
        },
        anchor: this.config.popupAnchor || [0, -15]
      };
    }

    if (this.config.tooltip) {
      entity.tooltip = {
        html: function(entity) {
          return that.viewer.mars.popup.getPopupForConfig({
            popup: that.config.tooltip
          }, entity.properties);
        },
        anchor: this.config.tooltipAnchor || [0, -15]
      };
    }

    this.dataSource.entities.add(entity);
    callback(entity);

  }

}

export default ArcFeatureGridLayer;