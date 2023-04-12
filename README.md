# Legonizer
Data processing of 3D geometries. 
This library transforms geometric data into a height map.
A first method uses raycasting to compute the height of the geometry according to the BufferGeometry three object.
With this height map the library generates CSV files to build the rendering in lego.

Library used :
three version ^0.147.0

To-Do :
- [ ] Optimize Raycast 
- [ ] When launch a raycast at a position, launch multiple and do the average in height
