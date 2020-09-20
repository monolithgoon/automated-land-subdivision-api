// GET DOM ELEMENTS
const SHAPEFILE_DD = document.getElementById('shapefile_select_dd')
const MOVING_FRAMES_DIR_OPTIONS_DD = document.getElementById('moving_frames_dir_options_dd')
const CHUNKIFY_BTN = document.getElementById('chunkify_allocation')


const polygonArea_Div = document.getElementById('poly_area')
const numFarmers_Div = document.getElementById('num_farmers')
const totalAllocation_Div = document.getElementById('total_allocation')
const unusedLand_Div = document.getElementById('unused_land')
const userInputs = document.querySelectorAll('input')
const chunksListing_Div = document.getElementById('chunk_coords_listing');
const mapLocation_Div = document.getElementById('map_location_overlay')



// IMPORTANT 
// GET DATA FROM BACKEND VIA HTML DATASET ATTRIBUTE
export function GET_PARCELIZED_AGC_API_DATA() {
   const dataStream = document.getElementById('api_data_stream').dataset.parcelizedagc
   return dataStream
}



export function READ_DOM() {

   // CONVERT USER IMPUT OF FARM SIZES TO AN NUMBERS ARRAY
   const ALLOCATIONS = [];
   let TOTAL_ALLOCATION = 0;

   // SANITIZE INPUTS & SAVE THEM
   userInputs.forEach(input => {

      input = input.value * 1
      
      if (input !== 0 && input !== NaN && input !== "" && input !== undefined && input !== null) {
         ALLOCATIONS.push(input)

         TOTAL_ALLOCATION += input
      }
   })

 
   return {
      ALLOCATIONS,
      TOTAL_ALLOCATION,
      SHAPEFILE_DD,
      MOVING_FRAMES_DIR_OPTIONS_DD,
      CHUNKIFY_BTN
   }
}



// CLEAR DOM
export function REFRESH_DOM(sfArea, sfLocation, sfCenter) {
   polygonArea_Div.innerHTML = `${sfArea.toFixed(1)} ha.`
   numFarmers_Div.innerHTML = "-";
   totalAllocation_Div.innerHTML = "-";
   unusedLand_Div.innerHTML = "-";
   chunksListing_Div.style.display = "none"
   mapLocation_Div.innerText = `${sfLocation} ${sfCenter[0].toFixed(5)}°E ${sfCenter[1].toFixed(5)}°N`
}



// RENDER CHUNKIFY DATA ON DOM (_V1)
export function RENDER_DOM_DATA({shapefileArea, allocations, totalHectares, chunksGeojson, gridChunks}) {      

      // REPORT POLYGON AREA TO DOM
      polygonArea_Div.innerHTML = `${shapefileArea.toFixed(1)} ha.`
   

      numFarmers_Div.innerText = allocations.length;
      totalAllocation_Div.innerText = `${totalHectares} ha.`
      let unusedLandArea = shapefileArea - totalHectares;
      unusedLand_Div.innerHTML = `${(unusedLandArea).toFixed(0)} ha.`
   
      
      // RENDER CHUNK COORDINATES ON DOM
      chunksListing_Div.innerHTML = ""; // CLEAR THE PREVIOUS LIST
      chunksGeojson.forEach( (chunk, index) => {
         const chunkDiv = document.createElement('div')
         chunkDiv.className = 'chunk'
         chunkDiv.innerHTML = `Plot #${index+1} [ ${turf.bbox(chunk)[0].toFixed(4)} ] .. [ ${turf.bbox(chunk)[1].toFixed(4)} ]
                                    .. [ ${turf.bbox(chunk)[2].toFixed(4)} ] .. [ ${turf.bbox(chunk)[3].toFixed(4)} ]`
         chunksListing_Div.appendChild(chunkDiv)
         chunksListing_Div.style.display = "block";
         // chunksListing_Div.style.background = "white";
         chunksListing_Div.style.background = "#f5f6fa";
         // chunksListing_Div.style.border = "#dcdde1 1px solid";
         chunksListing_Div.style.border = "grey 1px solid";
      })
   
   
      // GET EACH CHUNKS' COORDINATES 
      // TODO > DISPLAY COORDS. INTELLIGENTLY 
      // FIXME > THE AREAS FOR EACH CHUNK POLYGON ARE WRONG
      gridChunks.forEach(chunk => console.log(turf.cleanCoords(turf.union(...chunk))))

}



// RENDER CHUNKIFY DATA ON DOM (_V2)
export function RENDER_DATA({allocationTotal, unallocatedLandArea, PROCESSED_CHUNKS}) {      

   numFarmers_Div.innerText = PROCESSED_CHUNKS.length;
   unusedLand_Div.innerText = `${(unallocatedLandArea).toFixed(1)} ha.`
   
   // CLEAR THE LISTINGS EACH TIME THIS FN. IS CALLED
   chunksListing_Div.innerText = "";
   totalAllocation_Div.innerText = "";

   const listingHeader_div = document.createElement('div')
   listingHeader_div.innerHTML = `Parcelized Plots' Coordinates <br><br>`
   listingHeader_div.className = "coords-listing-header"
   chunksListing_Div.appendChild(listingHeader_div);

   // APPLY STYLING
   chunksListing_Div.style.display = "block";
   chunksListing_Div.style.background = "#f5f6fa";
   chunksListing_Div.style.border = "grey 1px solid";

   
   // RENDER TOTAL NUM. OF ALLOCATIONS
   totalAllocation_Div.innerText = `${allocationTotal.toFixed(1)} ha.`;
   
   // LIST COORDINATES
   PROCESSED_CHUNKS.forEach((chunk, index) => {

      chunk = turf.truncate(chunk, {precision: 3, coordinates: 2})

      const chunk_Div = document.createElement('div');
      chunk_Div.className = 'chunk'

      // chunk_Div.innerHTML = `Plot #${index + 1} ${JSON.stringify(chunk.properties)} ${JSON.stringify(chunk.geometry.coordinates)} <br><br>`
      chunk_Div.innerHTML = `Plot #${index + 1} <br> ${JSON.stringify(chunk.geometry.coordinates)} <br><br>`

      chunksListing_Div.appendChild(chunk_Div);

   });
}