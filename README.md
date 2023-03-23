# Automated Land Subdivision API
> Helping put smallholder farmers on the map

![FieldDev Group Cover](https://user-images.githubusercontent.com/60096838/227154345-fd5e8a8f-c7b4-4cd2-85b7-4a0a81213c17.jpg)

Automatically divide up a contiguous land expanse into pre-specified chunk sizes. Instantly reports back precise, high-resolution plot boundary coordinates that enables precision agriculture. The tool works regardless of the size of the initial land expanse. 

Helps smallholder farmer geo-coops digitize their fam locations at very low cost.

## Resources

*[Frontend demo app](https://farmplots.web.app)*

*[Video demo (2min 23s)](https://www.loom.com/share/44a371170c8f46fe9bf30ed946f44604)*

*[Video pitch (3min 46s)](https://www.loom.com/share/c5ae871e21c1405e84ca1e573a9a7c99)*

## Usage

### [Detailed API Documentation](https://geoclusters.web.app)

### Process Flow

1. Use a smartphone app to capture `.gpx` tracks that trace the extent of the collective land

2. Upload the `.gpx` data for processing via this endpoint `/api/v2/geofiles/geofile/upload/`

3. Upload list of plot owners (farmers) & acreage allocation per. owner to `/api/v2/geo-clusters/geo-cluster/details/`

4. Query this endpoint `/api/v1/parcelized-agcs/?<rpeview_map_url_hash>` for a preview map of the subdivided plots.

![Auto-Parcelization Process Flow](https://user-images.githubusercontent.com/60096838/227159621-6dfccf1a-f4b4-4c76-9946-ed7512e18235.png)
