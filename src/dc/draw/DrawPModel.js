import DrawBase from "./DrawBase";
import Cesium from "cesium";
import { AttrModel } from "../attr";
import { Point } from "../point";
import { Tooltip } from "../utils";
import { EditPModel } from "../edit";
/*
 * @Description:
 * @version:
 * @Author: 宁四凯
 * @Date: 2020-08-19 08:33:41
 * @LastEditors: 宁四凯
 * @LastEditTime: 2020-08-28 09:02:18
 */
class DrawPModel extends DrawBase {
  type = "point";

  constructor(opts) {
    super(opts);
  }

  // 根据attribute参数创建Entity
  createFeature(attribute) {
    var _this = this;
    this._positions_draw = Cesium.Cartesian3.ZERO;
    var style = attribute.style;
    var modelPrimitive = this.primitives.add(
      Cesium.Model.fromGltf({
        url: style.modelUrl,
        modelMatrix: this.getModelMatrix(style),
        minimumPixelSize: style.minimumPixelSize || 30,
      })
    );

    modelPrimitive.readyPromise.then((model) => {
      _this.style2Entity(style, _this.entity);
    });

    modelPrimitive.attribute = attribute;
    this.entity = modelPrimitive;
    return this.entity;
  }

  getModelMatrix(cfg, position) {
    var hpRoll = new Cesium.HeadingPitchRoll(
      Cesium.Math.toRadians(cfg.heading || 0),
      Cesium.Math.toRadians(cfg.pitch || 0),
      Cesium.Math.toRadians(cfg.roll || 0)
    );

    var fixedFrameTransform = Cesium.Transforms.eastNorthUpToFixedFrame;
    var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
      position || this._positions_draw,
      hpRoll,
      this.viewer.scene.globe.ellipsoid,
      fixedFrameTransform
    );

    if (cfg.scale) {
      Cesium.Matrix4.multiplyByScale(modelMatrix, cfg.scale, modelMatrix);
    }
    return modelMatrix;
  }

  style2Entity(style, entity) {
    entity.modelMatrix = this.getModelMatrix(style, entity.position);
    return AttrModel.style2Entity(style, entity);
  }

  bindEvent() {
    var _this2 = this;
    this.getHandler().setInputAction((event) => {
      var point = Point.getCurrentMousePosition(
        _this2.viewer.scene,
        event.endPosition,
        _this2.entity
      );
      if (point) {
        _this2._positions_draw = point;
        _this2.entity.modelMatrix = _this2.getModelMatrix(
          _this2.entity.attribute.style
        );
      }

      _this2.tooltip.showAt(
        event.endPosition,
        Tooltip.message.draw.point.start
      );
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    this.getHandler().setInputAction((event) => {
      var point = Point.getCurrentMousePosition(
        _this2.viewer.scene,
        event.position,
        _this2.entity
      );
      if (point) {
        _this2._positions_draw = pointl;
        _this2.disable();
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  getEditClass(entity) {
    var _edit = new EditPModel(entity, this.viewer, this.dataSource);
    return this._bindEdit(_edit);
  }

  getAttrClass() {
    return AttrModel;
  }

  // 图形绘制结束后，更新属性
  finish() {
    this.entity.modelMatrix = this.getModelMatrix(this.entity.attribute.style);
    this.entity.editing = this.getEditClass(this.entity); // 绑定编辑对象
    this.entity.position = this.getDrawPosition();
  }
}

export default DrawPModel;
