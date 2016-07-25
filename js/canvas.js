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
    var COPY_PASTE_OFFSET = 10;

    // undo・redo
    var stateArr = [fabCanvas.toJSON()];      // 変更ステータス保存配列
    var evnDiseble = false;
    var STATE_BUFFER_NUM = 5;

    // zoomIn・ZoomOut
    var canvasScale = 1;
    var originCanvasWidth = width;
    var originCanvasHeight = height;
    var SCALE_FACTOR = 1.5;
    var MAX_SCALE = 3;
    var MIN_SCALE = 0.25;

    // -------------------------------------------------------------
    // オブジェクトを追加
    this.addObj = function(svgString, fileType) {

        fabric.loadSVGFromString(svgString, function(objects, options) {
            var obj = fabric.util.groupSVGElements(objects, options);

            // 元の位置を保存しておく
            obj.originTop = obj.top;
            obj.originLeft = obj.left;

            // JSON出力の追加項目を設定する
            obj.toObject = (function(toObject) {
                return function() {
                    return fabric.util.object.extend(toObject.call(this), {
                        hasRotatingPoint: this.hasRotatingPoint,
                        lockRotation: this.lockRotation,
                        lockScalingFlip: this.lockScalingFlip,
                        lockUniScaling: this.lockUniScaling,
                        originTop: this.originTop,
                        originLeft: this.originLeft,
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
            // リサイズ
            resizeObj(obj);
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
                var objects = fabCanvas.getObjects();
                for (var i in objects) {
                    resizeObj(objects[i]);
                }
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
        if (stateArr.length >= STATE_BUFFER_NUM) {
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
        // 一つだけ選択されていた場合に取得可能(null)
        var obj = fabCanvas.getActiveObject();
        // 複数選択されていた場合に取得可能(null)
        var group = fabCanvas.getActiveGroup();

        if (obj != null) {
            obj.originTop = obj.top / canvasScale;
            obj.originLeft = obj.left / canvasScale;

        }
        if (group != null) {
            var groupObj = group.getObjects();
            var groupTop = (group.top + (group.height / 2));
            var groupLeft = (group.left + (group.width / 2));
            for (var i = 0; i < groupObj.length; i++) {
                groupObj[i].originTop = (groupTop + groupObj[i].top) / canvasScale;
                groupObj[i].originLeft = (groupLeft + groupObj[i].left) / canvasScale;
            }
        }

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
                cloneObj.originTop = (groupTop + cloneObj.top) / canvasScale;
                cloneObj.originLeft = (groupLeft + cloneObj.left) / canvasScale;
                copyObjs.push(cloneObj);
            }
        }
    };
    // -------------------------------------------------------------
    // 貼り付け
    this.pasteObj = function() {
        for (var i = 0; i < copyObjs.length; i++) {
            copyObjs[i].originTop = (copyObjs[i].originTop + COPY_PASTE_OFFSET);
            copyObjs[i].originLeft = (copyObjs[i].originLeft + COPY_PASTE_OFFSET);
            // リサイズ
            resizeObj(copyObjs[i]);
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
    // オブジェクトのサイズを変更する
    var resizeObj = function(obj) {
        obj.scaleX = canvasScale;
        obj.scaleY = canvasScale;
        obj.top = obj.originTop * canvasScale;
        obj.left = obj.originLeft * canvasScale;
        obj.setCoords();
    };
    // -------------------------------------------------------------
    // canvasのサイズを変更する
    var resizeCanvas = function() {
        fabCanvas.discardActiveObject();
        fabCanvas.discardActiveGroup();

        fabCanvas.setWidth(originCanvasWidth * canvasScale);
        fabCanvas.setHeight(originCanvasHeight * canvasScale);

        var objects = fabCanvas.getObjects();
        for (var i in objects) {
            resizeObj(objects[i]);
        }

        fabCanvas.renderAll();
    };
    // -------------------------------------------------------------
    // canvas拡大
    this.zoomIn = function() {

        canvasScale = canvasScale * SCALE_FACTOR;

        resizeCanvas();
    };
    // -------------------------------------------------------------
    // canvas縮小
    this.zoomOut = function() {
        canvasScale = canvasScale / SCALE_FACTOR;

        resizeCanvas();
    };
    // -------------------------------------------------------------
    // リセット
    this.resetZoom = function() {
        canvasScale = 1;

        resizeCanvas();
    };
    // -------------------------------------------------------------
    // 設定を保存
    this.save = function() {
        return JSON.stringify(fabCanvas);
    };
    // -------------------------------------------------------------
    // 設定を読み込み
    this.load = function(jsonString) {
        fabCanvas.clear().renderAll();
        fabCanvas.loadFromJSON(jsonString, function() {
            var objects = fabCanvas.getObjects();
            for (var i in objects) {
                resizeObj(objects[i]);
            }
            fabCanvas.renderAll();
        });
    };
    // -------------------------------------------------------------

}
// -------------------------------------------------------------
