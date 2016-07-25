"use strict";

var FILE_TYPE = {
    SVG: 0,
    DXF: 1,
    IMG: 2,
    _SIZEOF : 3,
};

function Canvas(strCanvas)
{
    var fabCanvas = new fabric.Canvas(strCanvas, {
        imageSmoothingEnabled : false,      // 画像を平滑化しない
    });
    var copyObjs = [];     // コピーするオブジェクト

    // -------------------------------------------------------------
    // オブジェクトを追加
    this.addObj = function(svgString, fileType) {

        fabric.loadSVGFromString(svgString, function(objects, options) {
            var obj = fabric.util.groupSVGElements(objects, options);
            if (fileType == FILE_TYPE.IMG) {
                // 画像の場合は、回転できないようにする
                obj.hasRotatingPoint = false;
                obj.lockRotation = true;
                // 反転できないようにする
                obj.lockScalingFlip = true;
                // 比率をかけて拡大・縮小できないようにする
                obj.lockUniScaling = true;
            }
            fabCanvas.add(obj).renderAll();
        });
    };
    // -------------------------------------------------------------
    // 元に戻す
    this.undo = function() {
    }
    // -------------------------------------------------------------
    // 取り消す
    this.redo = function() {
    }
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
    }
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
    }
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
    }
    // -------------------------------------------------------------
    // すべてのオブジェクトを削除
    this.deleteAllObj = function() {
        fabCanvas.clear().renderAll();
    }
    // -------------------------------------------------------------
    // canvas拡大
    this.zoomIn = function(width, height) {
    }
    // -------------------------------------------------------------
    // canvas縮小
    this.zoomOut = function(width, height) {
    }
    // -------------------------------------------------------------
    // canvasのサイズを変更
    this.resizeCanvas = function(width, height) {
    }
    // -------------------------------------------------------------
    // canvasの内容をSVG文字列に出力
    this.getSvg = function() {
        return fabCanvas.toSVG();
    };
    // -------------------------------------------------------------
    // 設定を保存
    this.save = function() {
    };
    // -------------------------------------------------------------
    // 設定を読み込み
    this.load = function() {
    };
    // -------------------------------------------------------------

//// オブジェクト選択イベント
//fabCanvas.on('object:selected', function(options) {
//    //alert(options.target.fill);
//});
//// -------------------------------------------------------------
//// オブジェクト選択解除イベント
//fabCanvas.on('selection:cleared', function(options) {
//    //alert('cleared!');
//});
//// -------------------------------------------------------------


// 一つだけ選択されていた場合に取得可能(null)
//var obj = fabCanvas.getActiveObject();

// 複数選択されていた場合に取得可能(null)
//var group = fabCanvas.getActiveGroup();

// canvas上のすべてのオブジェクトを取得
//var allObj = fabCanvas.getObjects(); 


//canvas.item(0); // 先に追加したfabric.Rect(最初のオブジェクト)を参照します
//canvas.remove(rect); // 先に追加したfabric.Rectを削除します

// クローンを作成
//canvas.item(0).clone();




}
