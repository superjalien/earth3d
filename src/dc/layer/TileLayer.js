import BaseLayer from "./BaseLayer";
import Layer from './Layer';
import Cesium from 'cesium';
/*
 * @Description: 瓦片底图图层
 * @version: 
 * @Author: 宁四凯
 * @Date: 2020-08-15 14:22:35
 * @LastEditors: 宁四凯
 * @LastEditTime: 2020-08-21 09:05:21
 */

class TileLayer extends BaseLayer{

  constructor(cfg, viewer) {
    super(cfg, viewer);
    this.layer = null;
    this.hasOpacity = true;
    this._opacity = 1;
    this.hasZIndex = true;
  }

  // 添加
  add() {
    if (this.layer != null) {
      this.remove();
    }
    this.addEx();
    var imageryProvider = Layer.createImageryProvider(this.config);
    if (imageryProvider == null) {
      return;
    }

    var options = this.config;

    var imageryOpt = {
      show: true,
      alpha: this._opacity
    };

    if (options.rectangle && options.rectangle.xmin && options.rectangle.xmax && options.rectangle.ymin &&
      options.rectangle.ymax) {
      var xmin = options.rectangle.xmin;
      var xmax = options.rectangle.xmax;
      var ymin = options.rectangle.ymin;
      var ymax = options.rectangle.ymax;
      var rectangle = Cesium.Rectangle.fromDegrees(xmin, ymin, xmax, ymax);
      this.rectangle = rectangle;
      imageryOpt.rectangle = rectangle;
    }
    if (options.brightness) imageryOpt.brightness = options.brightness;
    if (options.contrast) imageryOpt.contrast = options.contrast;
    if (options.hue) imageryOpt.hue = options.hue;
    if (options.saturation) imageryOpt.saturation = options.saturation;
    if (options.gamma) imageryOpt.gamma = options.gamma;
    if (options.maximumAnisotropy) imageryOpt.maximumAnisotropy = options.maximumAnisotropy;
    if (options.minimumTerrainLevel) imageryOpt.minimumTerrainLevel = options.minimumTerrainLevel;
    if (options.maximumTerrainLevel) imageryOpt.maximumTerrainLevel = options.maximumTerrainLevel;

    this.layer = new Cesium.ImageryLayer(imageryProvider, imageryOpt);
    this.layer.config = this.config;

    this.viewer.imageryLayers.add(this.layer);

    this.setZIndex(this.config.order);

  }

  addEx() {
    // 子类使用
  }

  remove() {
    if (this.layer == null) {
      return;
    }
    this.removeEx();
    this.viewer.imageryLayers.remove(this.layer, true);
    this.layer = null;
  }

  removeEx() {
    // 子类使用
  }

  // 定位至数据区域
  centerAt(duration) {
    if (this.layer == null) return;

    if (this.config.extent || this.config.center) {
      this.viewer.mars.centerAt(this.config.extent || this.config.center, {
        duration: duration,
        isWgs84: true
      });
    } else if (this.rectangle) {
      this.viewer.camera.flyTo({
        destination: this.rectangle,
        duration: duration
      });
    } else {
      var rectangle = this.layer.imageryProvider.rectangle; //arcgis图层等，读取配置信息
      if (rectangle && rectangle != Cesium.Rectangle.MAX_VALUE && rectangle.west > 0 && rectangle.south >
        0 && rectangle.east > 0 && rectangle.north > 0) {
        this.viewer.camera.flyTo({
          destination: rectangle,
          duration: duration
        });
      }
    }
  }

  setOpacity(value) {
    this._opacity = value;
    if (this.layer == null) return;
    this.layer.alpha = value;
  }

  setZIndex(order) {
    if (this.layer == null || order == null) return;

    //先移动到最顶层
    this.viewer.imageryLayers.raiseToTop(this.layer);
    var layers = this.viewer.imageryLayers._layers;
    for (var i = layers.length - 1; i >= 0; i--) {
      if (layers[i] == this.layer) continue;
      var _temp = layers[i].config;
      if (_temp && _temp.order) {
        if (order < _temp.order) {
          this.viewer.imageryLayers.lower(this.layer);
        }
      }
    }
  }

}

export default TileLayer;