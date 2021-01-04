const BOUNDS = {
    west: 120.58254,
    east: 120.738342,
    south: 27.964375,
    north: 28.031321,
};
const verIndex = 0.003;
const herIndex = 0.003;

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
            color: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.GRAY,
            outlineWidth: 3,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            position,
        })
    })
}