const THREE = require('three');

/**
 *
 * @param {BufferGeometry} geometryBuffer Geometry that will be transform in heightmap
 * @param {Int32Array} ratio ratio to discretise modelisation
 */
const legonizer = function(geometryBuffer, ratio) {

    if (!geometryBuffer.attributes.position.array) throw new Error('geometryBuffer empty');

    if (ratio == null) throw new Error('ratio parameter not given');
  
    geometryBuffer.computeBoundingBox(); //Generate Bounding box of the geometry
  
    const maxLegoHeight = 10;
    const bbMockUp = geometryBuffer.boundingBox;
    const widthMockUp = bbMockUp.max.x - bbMockUp.min.x;
    const stepDistance = widthMockUp / ratio;
    const ratioY = Math.trunc(
      Math.abs(bbMockUp.min.y - bbMockUp.max.y) / stepDistance
    );
    const mesh = new THREE.Mesh(geometryBuffer);
    const raycaster = new THREE.Raycaster();
    const maxZMockup = bbMockUp.max.z;
    const heightMap = Array.from(Array(ratioY), () => new Array(ratio));
  
    for (let j = 0; j < ratioY; j++) {
      for (let i = 0; i < ratio; i++) {
        const positionRaycast = new THREE.Vector3(
          bbMockUp.min.x + i * stepDistance,
          bbMockUp.min.y + j * stepDistance,
          maxZMockup
        );
        raycaster.set(positionRaycast, new THREE.Vector3(0, 0, -1));
        const objects = raycaster.intersectObject(mesh);
        if (objects.length > 0) {
          const object = objects[0];
          heightMap[j][i] = maxZMockup - object.distance;
        } else {
          heightMap[j][i] = 0;
        }
      }
    }
    // Lego transformation
    const ratioZ = maxZMockup / maxLegoHeight;
    for (let i = 0; i < heightMap.length; i++) {
      for (let j = 0; j < heightMap[i].length; j++)
        heightMap[i][j] = Math.trunc(heightMap[i][j] / ratioZ);
    }
    return heightMap;
  }
  
  /**
   * generate CSV file from an heightmap
   * @param {Array} heightMap Array in two dimension that will be integrated in the CSV file
   */
  const generateCSVwithHeightMap = function(heightMap) {
    let csvContent = 'data:text/csv;charset=utf-8,';
  
    for (let j = heightMap.length - 1; j >= 0; j--) {
      const value = heightMap[j];
      for (let i = 0; i < value.length; i++) {
        const innerValue = value[i] === null ? '' : value[i].toString();
        const result = innerValue.replace(/"/g, '""');
        if (i > 0) csvContent += ';';
        csvContent += result;
      }
  
      csvContent += '\n';
    }
  
    const encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
  }

  module.exports = {legonizer, generateCSVwithHeightMap}