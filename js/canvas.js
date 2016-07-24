"use strict";

function Canvas(strCanvas)
{
    var fabCanvas = new fabric.Canvas(strCanvas);
    var fabObjArr = [];     // canvasに追加したオブジェクト配列
    var svgStringArr = [];  // canvasに追加したSVGデーター配列
    this.param2 = '';

    // オブジェクトを追加
    this.addObj = function(svgString) {
        // SVGデーターを保存
        svgStringArr.push(svgString);

        fabric.loadSVGFromString(svgString, function(objects, options) {
            var obj = fabric.util.groupSVGElements(objects, options);
            fabCanvas.add(obj).renderAll();
            fabObjArr.push(obj);
        });
    };

    // 選択されているオブジェクトを削除


    // すべてのオブジェクトを削除


    // canvasのサイズを変更


//    this.method1 = function (_param) {
//        return this.param1;
//    };
}

//canvas = new Canvas();
//canvas.param1 = [1, 2, 3, 4];
//console.log(canvas.method1());
