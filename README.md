# _Automated Land Subdivision API_
> Helping put smallholder farmers on the map

![FieldDev Group Cover](https://user-images.githubusercontent.com/60096838/227154345-fd5e8a8f-c7b4-4cd2-85b7-4a0a81213c17.jpg)

Automatically divide up a single, contiguous land expanse into pre-specified chunk sizes. Instantly reports back precise, high-resolution plot boundary coordinates that enables precision agriculture. The tool works regardless of the size of the initial land expanse.

Helps smallholder farmer geo-coops digitize their fam locations at very low cost.

## 🌐 *Resources*

### [_API Landing Page_](http://13.61.173.110/)

*[Frontend demo app](https://farmplots.web.app)*

*[Video demo (2min 23s)](https://www.loom.com/share/44a371170c8f46fe9bf30ed946f44604)*

![Automated Farm Cluster Parcelization Demo](https://github.com/monolithgoon/automated-land-subdivision-api/assets/60096838/3f884963-02a1-4455-b7d9-a281fc114ef7)

*[Video pitch (3min 46s)](https://www.loom.com/share/c5ae871e21c1405e84ca1e573a9a7c99)*

## 🛠️ *Usage*

### [_Detailed API Documentation_](http://13.61.173.110/api-guide)

### 🔄 *Process Flow*

1. Use a smartphone app to capture `.gpx` tracks that trace the extent of the collective land
2. Upload the `.gpx` data for processing via this endpoint `/api/v2/geofiles/geofile/upload/`
3. Upload list of plot owners (farmers) & acreage allocation per. owner to `/api/v2/geo-clusters/geo-cluster/details/`
4. Query this endpoint `/api/v1/parcelized-agcs/?<rpeview_map_url_hash>` for a preview map of the subdivided plots.

![Auto-Parcelization Process Flow](https://user-images.githubusercontent.com/60096838/227159621-6dfccf1a-f4b4-4c76-9946-ed7512e18235.png)

### 📊 *Automated Land Division Examples*

![responsive-cluster-1](https://user-images.githubusercontent.com/60096838/161726087-398efd30-1ff3-4535-877b-23a95393ba33.jpg)

![sat-map-closeup-1 (2)](https://user-images.githubusercontent.com/60096838/161726116-60a1771b-54c9-4ac0-bddb-7d58bf4d4b7f.png)

### 📝 *_NGINX Config_*

```bash
server {
   listen 80;
   server_name 13.61.173.110;

   root /var/www/land_subdivision_api;
   index index.html;

   proxy_set_header Upgrade $http_upgrade;
   proxy_set_header Connection 'upgrade';
   proxy_set_header Host $host;
   proxy_cache_bypass $http_upgrade;

   location / {
       proxy_pass http://localhost:9443;
       proxy_http_version 1.1;
   }

   location /api/ {
        proxy_pass http://localhost:9443/api/;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

   error_page 404 /404.html;
   location = /404.html {
       root /var/www/land_subdivision_api;
   }

   access_log /var/log/nginx/land_subdivision_api_access.log;
   error_log /var/log/nginx/land_subdivision_api_error.log;
}
```
