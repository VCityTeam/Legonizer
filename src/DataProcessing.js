const THREE = require('three');

/**
 * Transform BufferGeometry into an heightmap with THREE js raycast with a specific ratio that will be 
 * the maximum number of ray launch in x axis
 * @param {BufferGeometry} geometryBuffer Geometry that will be transform in heightmap
 * @param {Int32Array} ratio ratio to voxelize the modelisation
 * @param {Int32Array} xPlates width in plates of the lego mockup
 * @param {Int32Array} yPlates lenght in plates of the lego mockup
 * @returns {Array} the heightmaps of the geometry
 */
const createHeightMapFromBufferGeometry = function(geometryBuffer, ratio, xPlates, yPlates) {

  if (!geometryBuffer.attributes.position.array) throw new Error('geometryBuffer empty');

  if (ratio == null) throw new Error('ratio parameter not given');

  geometryBuffer.computeBoundingBox(); //Generate Bounding box of the geometry
  const ratioX = xPlates;
  const ratioY = yPlates;
  const maxLegoHeight = 10; // Max lego height for the higher buildings in the geometry
  const bbMockUp = geometryBuffer.boundingBox;
  const widthMockUp = bbMockUp.max.x - bbMockUp.min.x;
  const stepDistance = widthMockUp / ratio / ratioX; // Step to launch a ray 
  const mesh = new THREE.Mesh(geometryBuffer);
  const raycaster = new THREE.Raycaster();
  const maxZMockup = bbMockUp.max.z;
  const heightMap = Array.from(Array(ratioY * ratio), () => new Array(ratioX * ratio));

  for (let j = 0; j < ratioY * ratio; j++) {
    for (let i = 0; i < ratioX * ratio; i++) {
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
  const ratioZ = maxZMockup / maxLegoHeight; // Divide the size in Z with the maximum height of the building in the geometry - Maybe should be calculate differently if there is to much difference between the higher and the shorter ex : Skyscrapers
  for (let i = 0; i < heightMap.length; i++) {
    for (let j = 0; j < heightMap[i].length; j++)
      heightMap[i][j] = Math.trunc(heightMap[i][j] / ratioZ);
  }
  return heightMap;
}

    /**
   * Transform a bounding box in shorter BB with a size of lego plates
   * @param {Box3} boundingBox original bounding volume to transform
   * @param {Int16Array} xPlates width in plates to divide de BB
   * @param {Int16Array} yPlates lenght in plates to divide de BB
   * @returns {Array} the list of BB
   */
    const transformBBToLegoPlates = function(boundingBox, xPlates, yPlates){
      // const listLegoPlatesBB = [];
      const listLegoPlatesBB = Array.from(Array(parseInt(yPlates)), () => new Array(parseInt(xPlates)));
      const ratioX = boundingBox.max.x - boundingBox.min.x;
      const ratioY = boundingBox.max.y - boundingBox.min.y;
      console.log(listLegoPlatesBB.length);
      for( let j = 0; j < yPlates; j++){
        for ( let i = 0; i < xPlates; i++){
          const boundingBoxLego = new THREE.Box3(
            new THREE.Vector3(boundingBox.min.x + (i * ratioX), boundingBox.min.y + (j * ratioY), boundingBox.min.z),
            new THREE.Vector3(boundingBox.max.x - ((xPlates - (i + 1)) * ratioX), boundingBox.max.y - ((yPlates - (j + 1)) * ratioY), boundingBox.max.z));
  
            listLegoPlatesBB[j][i] = boundingBoxLego;
        }
      }
      return listLegoPlatesBB;
    }
  /**
   * Generate CSV file from an array in two dimension. The CSV file be automatically download in your browser
   * @param {Array} heightMap Array in two dimension that will be integrated in the CSV file
   * @param {String} name name of your CSV file output
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