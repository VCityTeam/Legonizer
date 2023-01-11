const { Box3, Vector3 } = require('three');
const THREE = require('three');

/**
 * Transform BufferGeometry into an heightmap with THREE js raycast with a specific ratio that will be 
 * the maximum number of ray launch in x axis
 * @param {BufferGeometry} geometryBuffer Geometry that will be transform in heightmap
 * @param {Int32Array} ratio ratio to voxelize the modelisation
 */
const createHeightMapFromBufferGeometry = function(geometryBuffer, ratio) {

    if (!geometryBuffer.attributes.position.array) throw new Error('geometryBuffer empty');

    if (ratio == null) throw new Error('ratio parameter not given');
  
    geometryBuffer.computeBoundingBox(); //Generate Bounding box of the geometry
  
    const maxLegoHeight = 10;
    const bbMockUp = geometryBuffer.boundingBox;
    const widthMockUp = bbMockUp.max.x - bbMockUp.min.x;
    const stepDistance = widthMockUp / ratio;
    const mesh = new THREE.Mesh(geometryBuffer);
    const raycaster = new THREE.Raycaster();
    const maxZMockup = bbMockUp.max.z;
    const heightMap = Array.from(Array(ratio), () => new Array(ratio));
  
    for (let j = 0; j < ratio; j++) {
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
   * 
   * @param {Box3} boundingBox 
   * @param {*} xPlates 
   * @param {*} yPlates 
   * @returns 
   */
  const transformBBToLegoPlates = function(boundingBox, xPlates, yPlates){
    const listLegoPlatesBB = [];
    const ratioX = boundingBox.max.x - boundingBox.min.x;
    const ratioY = boundingBox.max.y - boundingBox.min.y;
    for( let j = 0; j < yPlates; j++){
      for ( let i = 0; i < xPlates; i++){
        const boundingBoxLego = new THREE.Box3(
          new THREE.Vector3(boundingBox.min.x + (i * ratioX), boundingBox.min.y + (j * ratioY), boundingBox.min.z),
          new THREE.Vector3(boundingBox.max.x - ((xPlates - (i + 1)) * ratioX), boundingBox.max.y - ((yPlates - (j + 1)) * ratioY), boundingBox.max.z));

          listLegoPlatesBB.push(boundingBoxLego);
      }
    }
    return listLegoPlatesBB;
  }
  
  /**
   * Generate CSV file from an array in two dimension. The CSV file be automatically download in your browser
   * @param {Array} heightMap Array in two dimension that will be integrated in the CSV file
   */
  const generateCSVwithHeightMap = function(heightMap, name) {
    let csvContent = 'data:text/csv;charset=utf-8,';
  
    //Complete CSV
    for (let j = heightMap.length - 1; j >= 0; j--) { //decrement because the filling start in top left 
      const value = heightMap[j];
      for (let i = 0; i < value.length; i++) {
        const innerValue = value[i] === null ? '' : value[i].toString();
        const result = innerValue.replace(/"/g, '""');
        if (i > 0) csvContent += ';';
        csvContent += result;
      }
  
      csvContent += '\n';
    }
  
    let encodedUri = encodeURI(csvContent);
    let link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', name);
    document.body.appendChild(link); // Required for FF

    link.click();
  }

  module.exports = {createHeightMapFromBufferGeometry, generateCSVwithHeightMap, transformBBToLegoPlates}