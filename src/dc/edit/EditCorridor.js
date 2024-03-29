import EditPolyline from "./EditPolyline";

/*
 * @Description:
 * @version:
 * @Author: 宁四凯
 * @Date: 2020-08-26 15:09:56
 * @LastEditors: 宁四凯
 * @LastEditTime: 2020-08-27 10:19:44
 */
class EditCorridor extends EditPolyline {
  constructor(entity, viewer, dataSource) {
    super(entity, viewer, dataSource);
  }
  //修改坐标会回调，提高显示的效率
  changePositionsToCallback() {
    //var that = this;

    this._positions_draw =
      this.entity._positions_draw || this.entity.corridor.positions.getValue();
    //this.entity.corridor.positions = new Cesium.CallbackProperty(function (time) {
    //    return that.getPosition();
    //}, false);
  }
  //图形编辑结束后调用
  finish() {
    this.entity._positions_draw = this.getPosition();
  }
}

export default EditCorridor;
