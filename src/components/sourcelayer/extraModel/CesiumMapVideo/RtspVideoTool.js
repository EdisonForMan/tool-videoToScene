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