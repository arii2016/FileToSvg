"use strict";

var FILE_TYPE = {
    SVG: 0,
    DXF: 1,
    IMG: 2,
    _SIZEOF : 3,
};

// -------------------------------------------------------------
function Canvas(strCanvas, width, height)
{
    var fabCanvas = new fabric.Canvas(strCanvas, {
        width: width, 
        height: height,
        imageSmoothingEnabled : false,      // 画像を平滑化しない
    });

    // コピー・ペースト
    var copyObjs = [];      // コピーするオブジェクト

    // undo・redo
    var stateArr = [fabCanvas.toJSON()];      // 変更ステータス保存配列
    var evnDiseble = false;

    // -------------------------------------------------------------
    // オブジェクトを追加
    this.addObj = function(svgString, fileType) {

        fabric.loadSVGFromString(svgString, function(objects, options) {
            var obj = fabric.util.groupSVGElements(objects, options);

            // JSON出力の追加項目を設定する
            obj.toObject = (function(toObject) {
                return function() {
                    return fabric.util.object.extend(toObject.call(this), {
                        hasRotatingPoint: this.hasRotatingPoint,
                        lockRotation: this.lockRotation,
                        lockScalingFlip: this.lockScalingFlip,
                        lockUniScaling: this.lockUniScaling,
                    });
                };
            })(obj.toObject);

            // 画像は変形を制限する
            if (fileType == FILE_TYPE.IMG) {
                // 画像の場合は、回転できないようにする
                obj.hasRotatingPoint = false;
                obj.lockRotation = true;
                // 反転できないようにする
                obj.lockScalingFlip = true;
                // 比率をかけて拡大・縮小できないようにする
                obj.lockUniScaling = true;
            }

            // 追加
            fabCanvas.add(obj).renderAll();
        });
    };
    // -------------------------------------------------------------
    this.undo = function() {
        if (1 < stateArr.length) {
            evnDiseble = true;
            fabCanvas.clear().renderAll();
            fabCanvas.loadFromJSON(stateArr[stateArr.length - 2], function() {
                fabCanvas.renderAll();
                evnDiseble = false;
            });
            stateArr.pop();
        }
    };
    // -------------------------------------------------------------
    // 変更ステータス更新
    var updateState = function() {
        if (evnDiseble) {
            return;
        }
        if (stateArr.length > 4) {
            stateArr.shift();
        }
        stateArr.push(fabCanvas.toJSON());
    };
    // -------------------------------------------------------------
    // オブジェクト追加イベント
    fabCanvas.on('object:added', function(options) {
        updateState();
    });
    // -------------------------------------------------------------
    // オブジェクト移動後イベント
    fabCanvas.on('object:modified', function(options) {
        updateState();
    });
    // -------------------------------------------------------------
    // オブジェクト削除イベント
    fabCanvas.on('object:removed', function(options) {
        updateState();
    });
    // -------------------------------------------------------------
    // コピー
    this.copyObj = function() {
        // 一つだけ選択されていた場合に取得可能(null)
        var obj = fabCanvas.getActiveObject();
        // 複数選択されていた場合に取得可能(null)
        var group = fabCanvas.getActiveGroup();

        copyObjs = [];

        if (obj != null) {
            var cloneObj = fabric.util.object.clone(obj);
            copyObjs.push(cloneObj);

        }
        if (group != null) {
            var groupObj = group.getObjects();
            var groupTop = (group.top + (group.height / 2));
            var groupLeft = (group.left + (group.width / 2));
            for (var i = 0; i < groupObj.length; i++) {
                var cloneObj = fabric.util.object.clone(groupObj[i]);
                cloneObj.set("top", groupTop + cloneObj.top);
                cloneObj.set("left", groupLeft + cloneObj.left);
                copyObjs.push(cloneObj);
            }
        }
    };
    // -------------------------------------------------------------
    // 貼り付け
    this.pasteObj = function() {
        for (var i = 0; i < copyObjs.length; i++) {
            copyObjs[i].set("top", copyObjs[i].top + 10);
            copyObjs[i].set("left", copyObjs[i].left + 10);
            var cloneObj = fabric.util.object.clone(copyObjs[i]);
            fabCanvas.add(cloneObj);
        }

        fabCanvas.discardActiveObject();
        fabCanvas.discardActiveGroup();
        fabCanvas.renderAll();
    };
    // -------------------------------------------------------------
    // 選択されているオブジェクトを削除
    this.deleteOneObj = function() {
        // 一つだけ選択されていた場合に取得可能(null)
        var obj = fabCanvas.getActiveObject();
        // 複数選択されていた場合に取得可能(null)
        var group = fabCanvas.getActiveGroup();

        if (obj != null) {
            obj.remove();
        }
        if (group != null) {
            group.forEachObject(function(a) {
                fabCanvas.remove(a);
            });
            fabCanvas.discardActiveGroup();
            fabCanvas.renderAll();
        }
    };
    // -------------------------------------------------------------
    // すべてのオブジェクトを削除
    this.deleteAllObj = function() {
        fabCanvas.clear().renderAll();
    };
    // -------------------------------------------------------------
    // canvasの内容をSVG文字列に出力
    this.getSvg = function() {
        return fabCanvas.toSVG();
    };
    // -------------------------------------------------------------
    // canvas拡大
    this.zoomIn = function(width, height) {
    };
    // -------------------------------------------------------------
    // canvas縮小
    this.zoomOut = function(width, height) {
    };
    // -------------------------------------------------------------
    // 設定を保存
    this.save = function() {
        return fabCanvas.toJSON();
    };
    // -------------------------------------------------------------
    // 設定を読み込み
    this.load = function(jsonString) {
        fabCanvas.loadFromJSON(jsonString, function(objects, options) {
            fabCanvas.renderAll();
        });
    };
    // -------------------------------------------------------------




// canvas上のすべてのオブジェクトを取得
//var allObj = fabCanvas.getObjects(); 




}
// -------------------------------------------------------------
