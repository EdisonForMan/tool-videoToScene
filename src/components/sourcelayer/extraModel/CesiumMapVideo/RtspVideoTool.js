import { add } from "ol/coordinate";

const BOUNDS = {
    west: 120.58254,
    east: 120.738342,
    south: 27.984375,
    north: 28.031321,
};
const verIndex = 0.004;
const herIndex = 0.004;
/**
 * 选中视频
 * @param {*} id 
 */
export const forceOnEntity = (id) => {
    if (window.etyEdits) {
        window.etyEdits.setEditObject(window.etys[id]);
        window.etyEdits._polygon.show = false;
        window.etyEdits._polygon.show = true;
    } else {
        window.etyEdits = new Cesium.EditHandler(
            window.earth,
            window.etys[id]
        );
        window.etyEdits.isEditZ = false;
    }
    // window.etyEdits.activate();
}

/**
 * 左键按下事件
 * @param {*} id 
 */
export const mouseDownForce = (e) => {
    const pick = window.earth.scene.pick(e.position);
    if (pick && pick.id.id && ~pick.id.id.indexOf("Rtsp")) {
        window.etyEdits && window.etyEdits.clear()
        window.doDragFlag = true;
        window.forceDragObject = pick;
        window.earth.scene.screenSpaceCameraController.enableRotate = false;
    }

}

/**
 * 左键抬起事件
 */
export const mouseUpRelease = () => {
    window.doDragFlag = false;
    window.forceDragObject = undefined;
    window.earth.scene.screenSpaceCameraController.enableRotate = true;
}

/**
 * 左键移动事件
 * @param {*} e 
 */
export const mouseMove = (movement) => {
    if (window.doDragFlag && window.forceDragObject) {
        let startPosition = window.earth.scene.pickPosition(movement.startPosition);
        let endPosition = window.earth.scene.pickPosition(movement.endPosition);
        window.forceDragObject.id._position = endPosition
        if (window.forceDragObject.id.polygon) {
            const polygonPreviousCoordinates = window.forceDragObject.id.polygon.hierarchy.getValue();
            let currentsPoint = [];
            for (let i = 0; i < polygonPreviousCoordinates.positions.length; i++) {
                polygonPreviousCoordinates.positions[i].x += (endPosition.x - startPosition.x);
                polygonPreviousCoordinates.positions[i].y += (endPosition.y - startPosition.y);
                polygonPreviousCoordinates.positions[i].z += (endPosition.z - startPosition.z);
                currentsPoint.push(polygonPreviousCoordinates.positions[i])
            }
            window.forceDragObject.id.polygon.hierarchy._value = {
                holes: [],
                positions: currentsPoint
            };
            forceOnEntity(window.forceDragObject.id._id)
        }
    }
}

/**
 * 画鹿城点
 */
export const drawLuChengOPoints = () => {
    const { west, east, south, north } = BOUNDS;
    const points = [];
    for (let i = west; i <= east; i += herIndex) {
        for (let j = south; j <= north; j += verIndex) {
            points.push([i, j]);
        }
    }
    window.billboardMap['luchengPoints'] = window.earth.scene.primitives.add(new Cesium.PointPrimitiveCollection());
    window.labelMap['luchengPoints'] = window.earth.scene.primitives.add(new Cesium.LabelCollection());
    points.map(([x, y], i) => {
        const X = x.toFixed(6);
        const Y = y.toFixed(6);
        const position = Cesium.Cartesian3.fromDegrees(
            parseFloat(X),
            parseFloat(Y),
            0
        );
        window.featureMap["Lucheng_" + i] = { geometry: { x, y } };
        window.billboardMap['luchengPoints'].add({
            id: "Lucheng_" + i,
            pixelSize: 8,
            color: Cesium.Color.YELLOW,
            outlineColor: Cesium.Color.RED,
            outlineWidth: 3,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            position,
        })
        window.labelMap['luchengPoints'].add({
            id: "Lucheng_label_" + i,
            text: `${X} , ${Y}`,
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            font: "10px",
            scale: 1,
            outlineWidth: 4,
            showBackground: true,
            backgroundColor: Cesium.Color(0.165, 0.165, 0.165, 0.1),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 2000),
            pixelOffset: new Cesium.Cartesian2(0, -30),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            position
        });
    })
}