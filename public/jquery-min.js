var _0x2005=['#686de0','#535c68','polygonLabel_','farmer_id','#78e08f','#a29bfe','forEach','#130f40','media','symbol','toUpperCase','toFixed','getElementById','prototype','exports','outlineLayer','map','scrollTo','parcelizedagc','truncate','parentNode','Popup','#2d3436','\x20<br><br>','toString','*\x20{\x0d\x0a\x09font-family:\x20\x27Roboto\x27,\x20sans-serif;\x0d\x0a}\x0d\x0a\x0d\x0abody\x20{\x0d\x0a\x09margin:\x20auto;\x0d\x0a\x09font-family:\x20Arial,\x20Helvetica,\x20sans-serif;\x0d\x0a\x09font-size:\x2012px;\x0d\x0a}\x0d\x0a\x0d\x0a.app-container\x20{\x0d\x0a\x09display:\x20grid;\x0d\x0a\x09/*\x20grid-template-rows:\x20.8fr\x201fr;\x20*/\x0d\x0a\x09grid-template-rows:\x20auto\x201fr;\x0d\x0a\x09grid-gap:\x203px;\x0d\x0a\x09\x0d\x0a\x09/*\x20background:\x20#535c68;\x20*/\x0d\x0a\x09\x0d\x0a}\x0d\x0a\x0d\x0a#map\x20{\x0d\x0a\x09height:\x2060vh;\x0d\x0a\x09/*\x20REMOVE\x20>\x20THIS\x20IS\x20CAUSING\x20THE\x20MAPBOX\x20LAYERS\x20TO\x20BE\x20OFFSET\x20*/\x0d\x0a\x09/*\x20display:\x20grid;\x0d\x0a\x09grid-template-columns:\x202fr\x204fr;\x0d\x0a\x09grid-template-rows:\x206fr\x200.3fr;\x0d\x0a\x09grid-template-areas:\x20\x0d\x0a\x09\x09\x09\x09\x09\x22.\x20.\x22\x0d\x0a\x09\x09\x09\x09\x09\x22oranges\x20grapes\x22;\x20*/\x0d\x0a}\x0d\x0a\x0d\x0a.section-2-container\x20{\x0d\x0a\x09display:\x20grid;\x0d\x0a\x0d\x0a\x09/*\x20background:\x20white;\x20*/\x0d\x0a}\x0d\x0a\x0d\x0a.summaries\x20{\x0d\x0a\x09padding:\x2010px\x200;\x0d\x0a\x09border-bottom:\x20none;\x0d\x0a\x09display:\x20grid;\x0d\x0a\x09grid-template-columns:\x20repeat(4,\x201fr);\x0d\x0a\x09background:\x20white;\x0d\x0a}\x0d\x0a\x0d\x0a.num-farmers,\x0d\x0a.allocated-hectares,\x0d\x0a.shapefile-area,\x0d\x0a.unused-land-area\x20{\x0d\x0a\x20\x20padding:\x200\x2010px;\x0d\x0a\x20\x20display:\x20grid;\x0d\x0a\x20\x20grid-template-rows:\x20.2fr\x201fr;\x0d\x0a\x20\x20border-right:\x201px\x20solid\x20#eee\x0d\x0a}\x0d\x0a\x0d\x0a.num-farmers\x20{\x0d\x0a\x09text-align:\x20center;\x0d\x0a}\x0d\x0a\x0d\x0a.aggr-data\x20{\x0d\x0a\x09font-size:\x2022px;\x0d\x0a}\x0d\x0a\x0d\x0a.user-feedback-container\x20{\x0d\x0a\x09margin:\x200\x2010px;\x0d\x0a\x09margin-bottom:\x2010px;\x0d\x0a\x0d\x0a}\x0d\x0a\x0d\x0a.chunk-coords-listing\x20{\x0d\x0a\x09margin:\x200;\x0d\x0a\x09margin-top:\x2010px;\x0d\x0a\x09padding:\x2010px;\x0d\x0a\x09background:\x20#f5f6fa;\x0d\x0a\x09display:\x20grid;\x0d\x0a\x09grid-template-columns:\x20repeat(2,\x201fr);\x0d\x0a\x09display:\x20none;\x0d\x0a\x0d\x0a\x09/*\x20height:\x2080px;\x20*/\x0d\x0a\x09max-height:\x20170px;\x0d\x0a\x09\x0d\x0a\x09overflow-y:\x20scroll;\x0d\x0a}\x0d\x0a\x0d\x0a.coords-listing-header\x20{\x0d\x0a\x09font-weight:\x20900;\x0d\x0a\x09font-size:\x2013px;\x0d\x0a}\x0d\x0a\x0d\x0a.chunk:hover{\x0d\x0a\x09font-weight:\x20700;\x0d\x0a\x09cursor:\x20pointer;\x0d\x0a}\x0d\x0a\x0d\x0aselect,\x0d\x0abutton\x20{\x0d\x0a\x09width:\x20100%;\x0d\x0a\x09height:\x2035px;\x0d\x0a\x09outline:\x20none;\x0d\x0a\x09border:\x20none;\x0d\x0a\x09font-size:\x2016px;\x0d\x0a}\x0d\x0a\x0d\x0aselect\x20{\x0d\x0a\x09padding-left:\x2010px;\x0d\x0a\x09background-color:\x20#f5f6fd;\x0d\x0a\x09background-color:\x20rgb(239,\x20233,\x20225);\x0d\x0a\x09font-size:\x2014px;\x0d\x0a\x09box-shadow:\x20none\x20!important;\x0d\x0a\x09outline:\x20none;\x0d\x0a}\x0d\x0a\x0d\x0aselect.moving-frames-dir-options-dd\x0d\x0a/*\x20select.shapefile-select-dd\x20*/\x0d\x0a{\x0d\x0a\x09width:\x20200px;\x0d\x0a}\x0d\x0a\x0d\x0aselect:focus\x20{\x0d\x0a\x09outline:\x201px\x20solid\x20rgb(65,\x20188,\x20235);\x0d\x0a}\x0d\x0a\x0d\x0aoption\x20{\x0d\x0a\x09padding:\x2020px\x2020px;\x0d\x0a}\x0d\x0a\x0d\x0abutton\x20{\x0d\x0a\x09font-size:\x2016px;\x0d\x0a\x09width:\x2045%;\x0d\x0a\x09border:\x20none;\x0d\x0a\x09background-color:\x20#009432;\x0d\x0a\x09background-color:\x20#574b90;\x0d\x0a\x09background-color:\x20#0abde3;\x0d\x0a\x09background-color:\x20rgb(159,\x20221,\x20125);\x0d\x0a\x09background-color:\x20rgb(117,\x20207,\x20240);\x0d\x0a\x09background-color:\x20rgb(107,\x20203,\x20239);\x0d\x0a\x09background-color:\x20rgb(65,\x20188,\x20235);\x0d\x0a\x09color:\x20white;\x0d\x0a}\x0d\x0a\x0d\x0abutton:active\x20{\x0d\x0a\x09background-color:\x20white;\x0d\x0a\x09color:\x20black;\x0d\x0a}\x0d\x0a\x0d\x0abutton:disabled\x20{\x0d\x0a\x09background-color:\x20#cccccc;\x0d\x0a\x09color:\x20white;\x0d\x0a}\x0d\x0a\x0d\x0a.form-control-group\x20{\x0d\x0a\x09padding:\x200\x200\x2015px;\x0d\x0a\x09display:\x20flex;\x0d\x0a\x09justify-content:\x20space-between;\x0d\x0a\x09/*\x20display:\x20none;\x20*/\x0d\x0a\x09/*\x20width:\x20100%;\x20*/\x0d\x0a\x09/*\x20display:\x20grid;\x0d\x0a\x09grid-template-columns:\x20auto\x20auto\x20auto;\x20*/\x0d\x0a}\x0d\x0a\x0d\x0a.form-input-group\x20{\x0d\x0a\x09display:\x20grid;\x0d\x0a\x09grid-template-columns:\x20repeat(5,\x201fr);\x0d\x0a\x09grid-gap:\x208px;\x0d\x0a}\x0d\x0a\x0d\x0ainput\x20{\x0d\x0a\x09height:\x2025px;\x0d\x0a\x09width:\x2095%;\x0d\x0a\x09border:\x201px\x20solid\x20grey;\x0d\x0a\x09text-align:\x20center;\x0d\x0a\x09font-weight:\x20900;\x0d\x0a\x09border-radius:\x202px;\x0d\x0a\x09outline:\x20thick;\x0d\x0a}\x0d\x0a\x0d\x0ainput:focus\x20{\x0d\x0a\x09outline:\x202px\x20solid\x20rgb(65,\x20188,\x20235);\x0d\x0a}\x0d\x0a\x0d\x0a.farm-detail-map\x20{\x0d\x0a\x09padding:\x200;\x0d\x0a\x09height:\x2040vh;\x0d\x0a\x20\x20overflow:\x20hidden;\x0d\x0a}\x0d\x0a\x0d\x0a\x0d\x0a\x0d\x0a/*\x20-----------\x20Non-Retina\x20Screens\x20-----------\x20*/\x0d\x0a@media\x20screen\x20\x0d\x0a\x20\x20and\x20(min-device-width:\x20700px)\x20\x0d\x0a\x20\x20and\x20(max-device-width:\x201600px)\x20{\x0d\x0a\x20\x20/*\x20and\x20(-webkit-min-device-pixel-ratio:\x201)\x20{\x20\x20*/\x0d\x0a\x0d\x0a\x09body\x20{\x0d\x0a\x09\x09font-size:\x2012px;\x0d\x0a\x09\x09overflow:\x20hidden;\x0d\x0a\x09}\x0d\x0a\x0d\x0a\x09.app-container\x20{\x0d\x0a\x09\x09grid-template-rows:\x201fr;\x0d\x0a\x09\x09grid-template-columns:\x20.8fr\x201fr;\x0d\x0a\x09}\x0d\x0a\x0d\x0a\x09#map\x20{\x0d\x0a\x09\x09height:\x20100vh;\x0d\x0a\x09}\x0d\x0a\x0d\x0a\x09.section-2-container\x20{\x0d\x0a\x09\x09grid-gap:\x203px;\x0d\x0a\x09\x09/*\x20grid-template-rows:\x20.2fr\x20.5fr\x201fr;\x20*/\x0d\x0a\x09\x09grid-template-rows:\x20.1fr\x20auto\x201fr;\x0d\x0a\x09}\x0d\x0a\x0d\x0a\x09button\x20{\x0d\x0a\x09\x09font-size:\x2012px;\x0d\x0a\x09}\x0d\x0a\x0d\x0a\x09.num-farmers,\x0d\x0a\x09.allocated-hectares,\x0d\x0a\x09.shapefile-area,\x0d\x0a\x09.unused-land-area\x20{\x0d\x0a\x09\x09padding:\x200\x2020px;\x0d\x0a\x09}\x0d\x0a\x0d\x0a\x09.aggr-data\x20{\x0d\x0a\x09\x09font-size:\x2027px;\x0d\x0a\x09}\x0d\x0a\x0d\x0a\x09.user-feedback-container\x20{\x0d\x0a\x09\x09margin-bottom:\x2010px;\x0d\x0a\x09\x09display:\x20grid;\x0d\x0a\x09\x09grid-template-columns:\x200fr\x201fr;\x0d\x0a\x09\x09height:\x20auto;\x0d\x0a\x09}\x0d\x0a\x0d\x0a\x09.chunk-coords-listing\x20{\x0d\x0a\x09\x09margin-top:\x200;\x0d\x0a\x09\x09display:\x20block;\x0d\x0a\x0d\x0a\x09}\x0d\x0a\x0d\x0a\x09.farm-detail-map\x20{\x0d\x0a\x09\x09height:\x20auto;\x0d\x0a\x09}\x0d\x0a\x0d\x0a\x09.chunk-polygon-label\x20{\x0d\x0a\x09\x09font-size:\x2010px;\x0d\x0a\x09\x09color:\x20black;\x0d\x0a\x09\x09background:\x20white;\x0d\x0a\x09\x09border:\x202px\x20solid\x20black\x0d\x0a\x09}\x0d\x0a\x0d\x0a}\x0d\x0a\x0d\x0a/*\x20-----------\x20Retina\x20Screens\x20-----------\x20*/\x0d\x0a@media\x20screen\x20\x0d\x0a\x20\x20and\x20(min-device-width:\x201200px)\x20\x0d\x0a\x20\x20and\x20(max-device-width:\x201600px)\x20\x0d\x0a\x20\x20and\x20(-webkit-min-device-pixel-ratio:\x202)\x0d\x0a\x20\x20and\x20(min-resolution:\x20192dpi)\x20{\x20\x0d\x0a\x09\x20\x0d\x0a\x09body{\x0d\x0a\x09\x09margin:\x208px;\x0d\x0a\x09}\x0d\x0a\x09\x0d\x0a}','clickedPolyon_','default','#f0932b','\x20<br>\x20','moving_frames_dir_options_dd','scrollHeight','appendChild','create','Couldn\x27t\x20find\x20a\x20style\x20target.\x20This\x20probably\x20means\x20that\x20the\x20value\x20for\x20the\x20\x27insert\x27\x20parameter\x20is\x20invalid.','center_lng','innerText','splice','insert','border','string','shapefileFill','location','mapbox://styles/mapbox/satellite-streets-v11','filter','°E\x20','load','push','pointer','nonce','setLngLat','black','map_location_overlay','background','css','\x20*/','api_data_stream','querySelectorAll','\x0a/*#\x20sourceMappingURL=data:application/json;base64,','Nigeria','cssText','fillLayer','sources','agc_area','createElement','cursor','pk.eyJ1IjoiYnBhY2h1Y2EiLCJhIjoiY2lxbGNwaXdmMDAweGZxbmg5OGx2YWo5aSJ9.zda7KLJF3TH84UU6OhW16w','removeChild','Plot\x20#','fill','__esModule','sourceMap','firstChild','coordinates','CHUNKIFY_BTN','#088','geometry','.close-btn\x20{\x0d\x0a\x20\x20\x20-webkit-font-smoothing:\x20antialiased;\x0d\x0a\x20\x20\x20text-size-adjust:\x20100%;\x0d\x0a\x20\x20\x20box-sizing:\x20inherit;\x0d\x0a\x20\x20\x20margin:\x200;\x0d\x0a\x20\x20\x20border:\x200;\x0d\x0a\x20\x20\x20background:\x200\x200;\x0d\x0a\x20\x20\x20color:\x20inherit;\x0d\x0a\x20\x20\x20font:\x20inherit;\x0d\x0a\x20\x20\x20height:\x2025px;\x0d\x0a\x20\x20\x20width:\x2025px;\x0d\x0a\x20\x20\x20text-align:\x20left;\x0d\x0a\x20\x20\x20appearance:\x20none;\x0d\x0a\x20\x20\x20user-select:\x20none;\x0d\x0a\x20\x20\x20cursor:\x20pointer;\x0d\x0a\x20\x20\x20border-radius:\x209999px!important;\x0d\x0a\x20\x20\x20position:\x20absolute!important;\x0d\x0a\x20\x20\x20top:\x200!important;\x0d\x0a\x20\x20\x20right:\x200!important;\x0d\x0a\x20\x20\x20z-index:\x202!important;\x0d\x0a\x20\x20\x20margin-top:\x2012px!important;\x0d\x0a\x20\x20\x20margin-right:\x2012px!important;\x0d\x0a\x20\x20\x20padding-top:\x2012px!important;\x0d\x0a\x20\x20\x20padding-bottom:\x2012px!important;\x0d\x0a\x20\x20\x20padding-left:\x2012px!important;\x0d\x0a\x20\x20\x20padding-right:\x2012px!important;\x0d\x0a\x20\x20\x20background-color:\x20rgba(31,51,73,.5)!important;\x0d\x0a}\x0d\x0a\x0d\x0a.leaflet-map-overlay\x20{\x0d\x0a\x20\x20\x20-webkit-font-smoothing:\x20antialiased;\x0d\x0a\x20\x20\x20padding:\x206px\x2025px;\x0d\x0a\x20\x20\x20position:\x20absolute!important;\x0d\x0a\x20\x20\x20top:\x200!important;\x0d\x0a\x20\x20\x20right:\x200!important;\x0d\x0a\x20\x20\x20height:\x20auto;\x0d\x0a\x20\x20\x20width:\x20auto;\x0d\x0a\x20\x20\x20text-size-adjust:\x20100%;\x0d\x0a\x20\x20\x20box-sizing:\x20inherit;\x0d\x0a\x20\x20\x20background:\x200\x200;\x0d\x0a\x20\x20\x20color:\x20white;\x0d\x0a\x20\x20\x20background-color:\x20rgba(31,51,73,.8)!important;\x0d\x0a\x20\x20\x20text-align:\x20center;\x0d\x0a\x20\x20\x20appearance:\x20none;\x20\x0d\x0a\x20\x20\x20user-select:\x20none;\x0d\x0a\x20\x20\x20z-index:\x20999!important;\x0d\x0a}','\x20ha.)','styleSheet','getCanvas','geojsonPolygon_','all','\x20<br>\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20Lat\x20','addLayer','unused_land','references','keys','/*#\x20sourceURL=','features','SHAPEFILE_DD','AerialWithLabels','setView','getSource','chunk_coords_listing','#f39c12','#8e44ad','chunk_size','display','@media\x20','Marker','join','undefined','unused_land_area','addTo','length','TrafficFlow','dataset','total_allocation','marker','properties','base','divIcon','...','object','Open\x20Sans\x20Regular','chunk','num_farmers','#f9ca24','bind','@import\x20url(https://fonts.googleapis.com/css?family=Roboto:300,300i,400&display=swap);','bbox','&copy;\x20Nduka\x20Okpue','geojson','function','#00a8ff','centerOfMass','mapbox://styles/mapbox/cjcunv5ae262f2sm9tfwg8i0w','#b71540','mapbox://styles/mapbox/outdoors-v10','removeLayer','parse','poly_area','area','smooth','setAttribute','MOVING_FRAMES_DIR_OPTIONS_DD','block','boolean','white','div','className','grey\x201px\x20solid','coords-listing-header','HTMLIFrameElement','#EAB543','body','#1B9CFC','#FD7272','bingLayer','shapefile_select_dd','updater','call','style','shapefileOutline','chunk_index','polygon','mouseenter','insertBefore','log','concat','#44bd32','Module','chunk-polygon-label','#be2edd','coordAll','green','layer','mapbox://styles/mapbox/cjerxnqt3cgvp2rmyuxbeqme7','center_lat','innerHTML','stringify','flyTo','defineProperty','createTextNode','head','removeSource','mapbox://styles/mapbox/cjku6bhmo15oz2rs8p2n9s2hm','kilometers','singleton'];(function(_0x3a10e7,_0x2005a3){var _0x3768dc=function(_0x450e96){while(--_0x450e96){_0x3a10e7['push'](_0x3a10e7['shift']());}};_0x3768dc(++_0x2005a3);}(_0x2005,0x158));var _0x3768=function(_0x3a10e7,_0x2005a3){_0x3a10e7=_0x3a10e7-0x0;var _0x3768dc=_0x2005[_0x3a10e7];return _0x3768dc;};!function(_0x3f4655){var _0x26c14a={};function _0xd0114b(_0xb1d257){if(_0x26c14a[_0xb1d257])return _0x26c14a[_0xb1d257][_0x3768('0x1e')];var _0x2e9202=_0x26c14a[_0xb1d257]={'i':_0xb1d257,'l':!0x1,'exports':{}};return _0x3f4655[_0xb1d257][_0x3768('0xa8')](_0x2e9202[_0x3768('0x1e')],_0x2e9202,_0x2e9202[_0x3768('0x1e')],_0xd0114b),_0x2e9202['l']=!0x0,_0x2e9202[_0x3768('0x1e')];}_0xd0114b['m']=_0x3f4655,_0xd0114b['c']=_0x26c14a,_0xd0114b['d']=function(_0x5da511,_0x37d26f,_0x5e8be4){_0xd0114b['o'](_0x5da511,_0x37d26f)||Object[_0x3768('0x9')](_0x5da511,_0x37d26f,{'enumerable':!0x0,'get':_0x5e8be4});},_0xd0114b['r']=function(_0x305c8a){_0x3768('0x76')!=typeof Symbol&&Symbol['toStringTag']&&Object[_0x3768('0x9')](_0x305c8a,Symbol['toStringTag'],{'value':_0x3768('0xb2')}),Object[_0x3768('0x9')](_0x305c8a,_0x3768('0x56'),{'value':!0x0});},_0xd0114b['t']=function(_0x1fdc33,_0x25aa6c){if(0x1&_0x25aa6c&&(_0x1fdc33=_0xd0114b(_0x1fdc33)),0x8&_0x25aa6c)return _0x1fdc33;if(0x4&_0x25aa6c&&_0x3768('0x82')==typeof _0x1fdc33&&_0x1fdc33&&_0x1fdc33['__esModule'])return _0x1fdc33;var _0x8dde00=Object[_0x3768('0x31')](null);if(_0xd0114b['r'](_0x8dde00),Object[_0x3768('0x9')](_0x8dde00,_0x3768('0x2b'),{'enumerable':!0x0,'value':_0x1fdc33}),0x2&_0x25aa6c&&_0x3768('0x38')!=typeof _0x1fdc33)for(var _0x52e30a in _0x1fdc33)_0xd0114b['d'](_0x8dde00,_0x52e30a,function(_0xc0382d){return _0x1fdc33[_0xc0382d];}['bind'](null,_0x52e30a));return _0x8dde00;},_0xd0114b['n']=function(_0x4e0f74){var _0x3e9e8a=_0x4e0f74&&_0x4e0f74[_0x3768('0x56')]?function(){return _0x4e0f74[_0x3768('0x2b')];}:function(){return _0x4e0f74;};return _0xd0114b['d'](_0x3e9e8a,'a',_0x3e9e8a),_0x3e9e8a;},_0xd0114b['o']=function(_0x3d8243,_0x5b9fbe){return Object[_0x3768('0x1d')]['hasOwnProperty']['call'](_0x3d8243,_0x5b9fbe);},_0xd0114b['p']='',_0xd0114b(_0xd0114b['s']=0x1);}([function(_0x937b13,_0x44d101,_0x274f42){'use strict';_0x937b13[_0x3768('0x1e')]=function(_0x1922a7){var _0x575f81=[];return _0x575f81[_0x3768('0x28')]=function(){return this[_0x3768('0x20')](function(_0x51b870){var _0xe6c6af=function(_0xebc9c5,_0x4a7972){var _0x257bea=_0xebc9c5[0x1]||'',_0x5bfbca=_0xebc9c5[0x3];if(!_0x5bfbca)return _0x257bea;if(_0x4a7972&&_0x3768('0x8c')==typeof btoa){var _0x261d9c=(_0x176b27=_0x5bfbca,_0x4e4287=btoa(unescape(encodeURIComponent(JSON[_0x3768('0x7')](_0x176b27)))),_0x599af4='sourceMappingURL=data:application/json;charset=utf-8;base64,'[_0x3768('0xb0')](_0x4e4287),'/*#\x20'[_0x3768('0xb0')](_0x599af4,_0x3768('0x47'))),_0x35d813=_0x5bfbca[_0x3768('0x4e')][_0x3768('0x20')](function(_0x3280af){return _0x3768('0x68')[_0x3768('0xb0')](_0x5bfbca['sourceRoot']||'')[_0x3768('0xb0')](_0x3280af,_0x3768('0x47'));});return[_0x257bea][_0x3768('0xb0')](_0x35d813)[_0x3768('0xb0')]([_0x261d9c])[_0x3768('0x75')]('\x0a');}var _0x176b27,_0x4e4287,_0x599af4;return[_0x257bea][_0x3768('0x75')]('\x0a');}(_0x51b870,_0x1922a7);return _0x51b870[0x2]?_0x3768('0x73')[_0x3768('0xb0')](_0x51b870[0x2],'\x20{')[_0x3768('0xb0')](_0xe6c6af,'}'):_0xe6c6af;})[_0x3768('0x75')]('');},_0x575f81['i']=function(_0x422ab6,_0x54c75d,_0x4ea576){_0x3768('0x38')==typeof _0x422ab6&&(_0x422ab6=[[null,_0x422ab6,'']]);var _0x38e9c2={};if(_0x4ea576)for(var _0x1cd426=0x0;_0x1cd426<this[_0x3768('0x79')];_0x1cd426++){var _0x187c9a=this[_0x1cd426][0x0];null!=_0x187c9a&&(_0x38e9c2[_0x187c9a]=!0x0);}for(var _0x5f0ed7=0x0;_0x5f0ed7<_0x422ab6[_0x3768('0x79')];_0x5f0ed7++){var _0x4b9d8a=[][_0x3768('0xb0')](_0x422ab6[_0x5f0ed7]);_0x4ea576&&_0x38e9c2[_0x4b9d8a[0x0]]||(_0x54c75d&&(_0x4b9d8a[0x2]?_0x4b9d8a[0x2]=''['concat'](_0x54c75d,'\x20and\x20')[_0x3768('0xb0')](_0x4b9d8a[0x2]):_0x4b9d8a[0x2]=_0x54c75d),_0x575f81['push'](_0x4b9d8a));}},_0x575f81;};},function(_0x42a0eb,_0x46cdd6,_0x53d922){_0x53d922(0x2),_0x53d922(0x6);},function(_0x2d81c7,_0x45e6bb,_0x121c19){var _0x160e6c=_0x121c19(0x3),_0x18ffc5=_0x121c19(0x4);_0x3768('0x38')==typeof(_0x18ffc5=_0x18ffc5[_0x3768('0x56')]?_0x18ffc5[_0x3768('0x2b')]:_0x18ffc5)&&(_0x18ffc5=[[_0x2d81c7['i'],_0x18ffc5,'']]);var _0x17a1c5={'insert':_0x3768('0xb'),'singleton':!0x1};_0x160e6c(_0x18ffc5,_0x17a1c5),_0x2d81c7[_0x3768('0x1e')]=_0x18ffc5['locals']||{};},function(_0x333ebc,_0x3b3f01,_0x5d4ecb){'use strict';var _0x324fed,_0x395020=function(){return void 0x0===_0x324fed&&(_0x324fed=Boolean(window&&document&&document[_0x3768('0x62')]&&!window['atob'])),_0x324fed;},_0x385fe6=function(){var _0x282b92={};return function(_0x4669f2){if(void 0x0===_0x282b92[_0x4669f2]){var _0x4db8f3=document['querySelector'](_0x4669f2);if(window[_0x3768('0xa0')]&&_0x4db8f3 instanceof window[_0x3768('0xa0')])try{_0x4db8f3=_0x4db8f3['contentDocument']['head'];}catch(_0x5d6cf0){_0x4db8f3=null;}_0x282b92[_0x4669f2]=_0x4db8f3;}return _0x282b92[_0x4669f2];};}(),_0x25d76b=[];function _0x27a130(_0x53f221){for(var _0x181700=-0x1,_0x3ddcb1=0x0;_0x3ddcb1<_0x25d76b[_0x3768('0x79')];_0x3ddcb1++)if(_0x25d76b[_0x3ddcb1]['identifier']===_0x53f221){_0x181700=_0x3ddcb1;break;}return _0x181700;}function _0x18317a(_0x6d0fce,_0x485320){for(var _0x1f411a={},_0x1993c3=[],_0x5557dc=0x0;_0x5557dc<_0x6d0fce[_0x3768('0x79')];_0x5557dc++){var _0x2b9731=_0x6d0fce[_0x5557dc],_0x1d5a09=_0x485320[_0x3768('0x7f')]?_0x2b9731[0x0]+_0x485320['base']:_0x2b9731[0x0],_0x1466e7=_0x1f411a[_0x1d5a09]||0x0,_0x58f830=''[_0x3768('0xb0')](_0x1d5a09,'\x20')[_0x3768('0xb0')](_0x1466e7);_0x1f411a[_0x1d5a09]=_0x1466e7+0x1;var _0x135b3a=_0x27a130(_0x58f830),_0x58f81d={'css':_0x2b9731[0x1],'media':_0x2b9731[0x2],'sourceMap':_0x2b9731[0x3]};-0x1!==_0x135b3a?(_0x25d76b[_0x135b3a][_0x3768('0x66')]++,_0x25d76b[_0x135b3a][_0x3768('0xa7')](_0x58f81d)):_0x25d76b[_0x3768('0x3f')]({'identifier':_0x58f830,'updater':_0x655051(_0x58f81d,_0x485320),'references':0x1}),_0x1993c3[_0x3768('0x3f')](_0x58f830);}return _0x1993c3;}function _0x402942(_0x50baa0){var _0x425000=document[_0x3768('0x50')](_0x3768('0xa9')),_0x319d01=_0x50baa0['attributes']||{};if(void 0x0===_0x319d01[_0x3768('0x41')]){var _0x414d2c=_0x5d4ecb['nc'];_0x414d2c&&(_0x319d01[_0x3768('0x41')]=_0x414d2c);}if(Object[_0x3768('0x67')](_0x319d01)[_0x3768('0x16')](function(_0x4cb375){_0x425000['setAttribute'](_0x4cb375,_0x319d01[_0x4cb375]);}),_0x3768('0x8c')==typeof _0x50baa0[_0x3768('0x36')])_0x50baa0[_0x3768('0x36')](_0x425000);else{var _0x19f6a1=_0x385fe6(_0x50baa0[_0x3768('0x36')]||_0x3768('0xb'));if(!_0x19f6a1)throw new Error(_0x3768('0x32'));_0x19f6a1[_0x3768('0x30')](_0x425000);}return _0x425000;}var _0x2348dd,_0x1a7af6=(_0x2348dd=[],function(_0x368046,_0x53cdea){return _0x2348dd[_0x368046]=_0x53cdea,_0x2348dd[_0x3768('0x3c')](Boolean)[_0x3768('0x75')]('\x0a');});function _0x5a365b(_0x5ca910,_0x3d4ef1,_0x1491a4,_0x3df435){var _0x34dde2=_0x1491a4?'':_0x3df435[_0x3768('0x18')]?_0x3768('0x73')['concat'](_0x3df435[_0x3768('0x18')],'\x20{')[_0x3768('0xb0')](_0x3df435['css'],'}'):_0x3df435[_0x3768('0x46')];if(_0x5ca910[_0x3768('0x5f')])_0x5ca910[_0x3768('0x5f')][_0x3768('0x4c')]=_0x1a7af6(_0x3d4ef1,_0x34dde2);else{var _0x439771=document['createTextNode'](_0x34dde2),_0x5d42dd=_0x5ca910['childNodes'];_0x5d42dd[_0x3d4ef1]&&_0x5ca910[_0x3768('0x53')](_0x5d42dd[_0x3d4ef1]),_0x5d42dd[_0x3768('0x79')]?_0x5ca910[_0x3768('0xae')](_0x439771,_0x5d42dd[_0x3d4ef1]):_0x5ca910[_0x3768('0x30')](_0x439771);}}function _0x3292d5(_0x10cb94,_0x12159b,_0x3e2a33){var _0xb4f18=_0x3e2a33['css'],_0x361c2a=_0x3e2a33['media'],_0x372c42=_0x3e2a33['sourceMap'];if(_0x361c2a?_0x10cb94[_0x3768('0x97')](_0x3768('0x18'),_0x361c2a):_0x10cb94['removeAttribute'](_0x3768('0x18')),_0x372c42&&btoa&&(_0xb4f18+=_0x3768('0x4a')[_0x3768('0xb0')](btoa(unescape(encodeURIComponent(JSON[_0x3768('0x7')](_0x372c42)))),_0x3768('0x47'))),_0x10cb94[_0x3768('0x5f')])_0x10cb94[_0x3768('0x5f')][_0x3768('0x4c')]=_0xb4f18;else{for(;_0x10cb94[_0x3768('0x58')];)_0x10cb94[_0x3768('0x53')](_0x10cb94['firstChild']);_0x10cb94[_0x3768('0x30')](document[_0x3768('0xa')](_0xb4f18));}}var _0x2230e5=null,_0x561765=0x0;function _0x655051(_0x3961fd,_0x20ed7a){var _0x3a1fec,_0x48f08e,_0x13f677;if(_0x20ed7a[_0x3768('0xf')]){var _0x292b4d=_0x561765++;_0x3a1fec=_0x2230e5||(_0x2230e5=_0x402942(_0x20ed7a)),_0x48f08e=_0x5a365b[_0x3768('0x87')](null,_0x3a1fec,_0x292b4d,!0x1),_0x13f677=_0x5a365b['bind'](null,_0x3a1fec,_0x292b4d,!0x0);}else _0x3a1fec=_0x402942(_0x20ed7a),_0x48f08e=_0x3292d5[_0x3768('0x87')](null,_0x3a1fec,_0x20ed7a),_0x13f677=function(){!function(_0x288412){if(null===_0x288412[_0x3768('0x24')])return!0x1;_0x288412[_0x3768('0x24')][_0x3768('0x53')](_0x288412);}(_0x3a1fec);};return _0x48f08e(_0x3961fd),function(_0x181f9c){if(_0x181f9c){if(_0x181f9c['css']===_0x3961fd[_0x3768('0x46')]&&_0x181f9c['media']===_0x3961fd['media']&&_0x181f9c[_0x3768('0x57')]===_0x3961fd[_0x3768('0x57')])return;_0x48f08e(_0x3961fd=_0x181f9c);}else _0x13f677();};}_0x333ebc[_0x3768('0x1e')]=function(_0x54b549,_0x2b2b54){(_0x2b2b54=_0x2b2b54||{})[_0x3768('0xf')]||_0x3768('0x9a')==typeof _0x2b2b54[_0x3768('0xf')]||(_0x2b2b54['singleton']=_0x395020());var _0x42c57d=_0x18317a(_0x54b549=_0x54b549||[],_0x2b2b54);return function(_0x3e6c86){if(_0x3e6c86=_0x3e6c86||[],'[object\x20Array]'===Object[_0x3768('0x1d')][_0x3768('0x28')][_0x3768('0xa8')](_0x3e6c86)){for(var _0x463916=0x0;_0x463916<_0x42c57d['length'];_0x463916++){var _0x239081=_0x27a130(_0x42c57d[_0x463916]);_0x25d76b[_0x239081][_0x3768('0x66')]--;}for(var _0xb89bda=_0x18317a(_0x3e6c86,_0x2b2b54),_0x293eff=0x0;_0x293eff<_0x42c57d[_0x3768('0x79')];_0x293eff++){var _0x1a8468=_0x27a130(_0x42c57d[_0x293eff]);0x0===_0x25d76b[_0x1a8468][_0x3768('0x66')]&&(_0x25d76b[_0x1a8468][_0x3768('0xa7')](),_0x25d76b[_0x3768('0x35')](_0x1a8468,0x1));}_0x42c57d=_0xb89bda;}};};},function(_0x14fa34,_0x129539,_0x53d5de){var _0x28e41a=_0x53d5de(0x0),_0x22e8ae=_0x53d5de(0x5);(_0x129539=_0x28e41a(!0x1))['i'](_0x22e8ae),_0x129539[_0x3768('0x3f')]([_0x14fa34['i'],_0x3768('0x88')]),_0x129539[_0x3768('0x3f')]([_0x14fa34['i'],_0x3768('0x29'),'']),_0x14fa34[_0x3768('0x1e')]=_0x129539;},function(_0xc5009a,_0x49c398,_0x9f2846){(_0x49c398=_0x9f2846(0x0)(!0x1))[_0x3768('0x3f')]([_0xc5009a['i'],_0x3768('0x5d'),'']),_0xc5009a['exports']=_0x49c398;},function(_0x2f1cd6,_0x45239c,_0x3f16d0){'use strict';_0x3f16d0['r'](_0x45239c),_0x3f16d0['d'](_0x45239c,_0x3768('0x20'),function(){return _0x446e38;}),_0x3f16d0['d'](_0x45239c,'leaflet_map',function(){return _0x4fc7ae;});const _0x23d10a=[_0x3768('0x5b'),_0x3768('0x6f'),_0x3768('0x70'),'#eb4d4b',_0x3768('0xb1'),_0x3768('0x17'),_0x3768('0x8d'),_0x3768('0x11'),_0x3768('0xa1'),_0x3768('0x15'),_0x3768('0x10'),_0x3768('0x86'),'#2d3436','#be2edd',_0x3768('0xa4'),_0x3768('0x14'),_0x3768('0x90'),_0x3768('0x2c'),_0x3768('0xa1'),_0x3768('0xa3'),_0x3768('0x26'),_0x3768('0x0'),_0x3768('0xa4'),_0x3768('0x14'),'#b71540',_0x3768('0x2c'),_0x3768('0xa1'),_0x3768('0xa3')],_0x444dc8=_0x58c7e8=>_0x23d10a[_0x58c7e8]?_0x23d10a[_0x58c7e8]:_0x3768('0x9b');function _0x174246(_0x59c20b,{layerID:_0x2e3541,color:_0x5f38a4,thickness:_0x38e0c2,fillOpacity:_0x5e63dc}={}){let _0x378b55=_0x444dc8(_0x2e3541);return{'fillLayer':{'id':_0x3768('0x61')+_0x2e3541,'type':_0x3768('0x55'),'source':{'type':_0x3768('0x8b'),'data':_0x59c20b},'paint':{'fill-color':''+(_0x5f38a4||_0x378b55),'fill-opacity':_0x5e63dc||0.2}},'outlineLayer':{'id':'polygonOutline_'+_0x2e3541,'type':'line','source':{'type':_0x3768('0x8b'),'data':_0x59c20b},'paint':{'line-color':''+(_0x5f38a4||_0x378b55),'line-opacity':0x1,'line-width':_0x38e0c2||0x1}}};}function _0x574975({map:_0x3a09ef,renderedLayers:_0xe4f6db=null,layerIDs:_0x4627d1=null}){_0xe4f6db&&_0xe4f6db[_0x3768('0x16')](_0x5c8921=>{_0x3a09ef['getSource'](_0x5c8921['id'])&&(_0x3a09ef[_0x3768('0x92')](_0x5c8921['id']),_0x3a09ef[_0x3768('0xc')](_0x5c8921['id']));}),_0x4627d1&&_0x4627d1[_0x3768('0x16')](_0x44b15a=>{_0x3a09ef[_0x3768('0x6d')](_0x44b15a)&&(_0x3a09ef[_0x3768('0x92')](_0x44b15a),_0x3a09ef[_0x3768('0xc')](_0x44b15a));});}function _0x87e50a(_0x4ddd05,_0xcb3842){_0x4ddd05[_0x3768('0x6d')](_0xcb3842['id'])?(_0x4ddd05[_0x3768('0x92')](_0xcb3842['id']),_0x4ddd05[_0x3768('0xc')](_0xcb3842['id']),_0x4ddd05[_0x3768('0x64')](_0xcb3842)):_0x4ddd05['addLayer'](_0xcb3842);}const _0x3b075c=[];function _0x1efdda(_0x3302ab,_0x4bd10a,_0x4aebd3){_0x3302ab['on']('click',''+_0x4aebd3['id'],function(_0x485368){window[_0x3768('0x21')](0x0,document[_0x3768('0xa2')][_0x3768('0x2f')],{'behavior':_0x3768('0x96')}),_0x485368[_0x3768('0x69')][0x0][_0x3768('0x3')];const _0x2c38ef=_0x485368['features'][0x0][_0x3768('0x7e')],_0x324cbe=_0x485368[_0x3768('0x69')][0x0]['geometry'],_0x520831=_0x324cbe[_0x3768('0x59')][0x0],_0x3a9ce6=_0x485368['lngLat'],_0x4f1214=_0x2c38ef[_0x3768('0xab')],_0x2de80a=_0x4f1214+'_'+0x5f5e0fe*Math['random'](),_0xcf8a54=(_0x2c38ef[_0x3768('0x95')]?_0x2c38ef[_0x3768('0x95')]:_0x2c38ef[_0x3768('0x71')],_0x2c38ef[_0x3768('0x5')]?_0x2c38ef[_0x3768('0x5')]:_0x3768('0x81')),_0x1ccc1a=_0x2c38ef[_0x3768('0x33')]?_0x2c38ef['center_lng']:'...',_0x1db949=_0x3768('0x2a')+_0x2de80a;_0x3b075c[_0x3768('0x3f')](_0x1db949),new mapboxgl[(_0x3768('0x25'))]()[_0x3768('0x42')](_0x485368['lngLat'])['setHTML'](_0x2c38ef[_0x3768('0x13')][_0x3768('0x1a')]()+_0x3768('0x63')+_0xcf8a54[_0x3768('0x1b')](0x5)+'°N\x20Lng\x20'+_0x1ccc1a[_0x3768('0x1b')](0x5)+'°E\x20<br>')[_0x3768('0x78')](_0x3302ab),_0x3302ab[_0x3768('0x64')]({'id':'clickedPolyon_'+_0x2de80a,'type':_0x3768('0x55'),'source':{'type':_0x3768('0x8b'),'data':_0x324cbe},'paint':{'fill-color':_0x23d10a[_0x4f1214-0x1],'fill-opacity':0.3}}),_0x4bd10a[_0x3768('0x6c')](_0x3a9ce6,16.5),L[_0x3768('0x7d')](_0x3a9ce6)[_0x3768('0x78')](_0x4bd10a),L['geoJSON'](_0x324cbe,{'color':_0x3768('0x9b'),'weight':0x4,'opacity':0x1})['addTo'](_0x4bd10a),L[_0x3768('0xac')]([..._0x520831],{'style':{'fillColor':_0x3768('0x2'),'fillOpacity':0.5,'color':_0x3768('0x9b'),'weight':0x3,'dashArray':'3','opacity':0x3}})['addTo'](_0x4bd10a),_0x520831[_0x3768('0x16')](_0x3073a7=>{L[_0x3768('0x7d')](_0x3073a7,{'icon':L[_0x3768('0x80')]({'className':_0x3768('0xb3'),'html':_0x3073a7[0x0][_0x3768('0x1b')](0x2)+',\x20'+_0x3073a7[0x1]['toFixed'](0x2),'iconSize':[0x64,0x14]}),'zIndexOffset':0x1})[_0x3768('0x78')](_0x4bd10a);});}),_0x3302ab['on'](_0x3768('0xad'),''+_0x4aebd3['id'],function(){_0x3302ab[_0x3768('0x60')]()['style'][_0x3768('0x51')]=_0x3768('0x40');}),_0x3302ab['on']('mouseleave',''+_0x4aebd3['id'],function(){_0x3302ab[_0x3768('0x60')]()[_0x3768('0xa9')]['cursor']='';});}function _0x4e0ebe(_0xc24154,_0x378add,_0x363dd6){return{'id':_0x3768('0x12')+_0x378add,'type':_0x3768('0x19'),'source':{'type':'geojson','data':turf[_0x3768('0x8e')](_0xc24154)},'layout':{'text-font':[_0x3768('0x83')],'text-field':_0x3768('0x54')+_0x378add+'\x20('+_0x363dd6+_0x3768('0x5e'),'text-size':0xa},'paint':{'text-color':_0x3768('0x43')}};}const _0x4416f3=document[_0x3768('0x1c')](_0x3768('0xa6')),_0x249bfe=document['getElementById'](_0x3768('0x2e')),_0x740f15=document[_0x3768('0x1c')]('chunkify_allocation'),_0x5e0610=(document[_0x3768('0x1c')](_0x3768('0x94')),document[_0x3768('0x1c')](_0x3768('0x85')),document['getElementById'](_0x3768('0x7c')),document[_0x3768('0x1c')](_0x3768('0x65')),document[_0x3768('0x49')]('input'));document[_0x3768('0x1c')](_0x3768('0x6e')),document[_0x3768('0x1c')](_0x3768('0x44'));function _0x3ecccc(){const _0x34ec67=[];let _0x5239ff=0x0;return _0x5e0610[_0x3768('0x16')](_0x583219=>{0x0!==(_0x583219=0x1*_0x583219['value'])&&NaN!==_0x583219&&''!==_0x583219&&null!=_0x583219&&(_0x34ec67['push'](_0x583219),_0x5239ff+=_0x583219);}),{'ALLOCATIONS':_0x34ec67,'TOTAL_ALLOCATION':_0x5239ff,'SHAPEFILE_DD':_0x4416f3,'MOVING_FRAMES_DIR_OPTIONS_DD':_0x249bfe,'CHUNKIFY_BTN':_0x740f15};}let _0x2f0351,_0xe9f2bb,_0x20e541=[];mapboxgl['accessToken']=_0x3768('0x52');const _0x446e38=new mapboxgl['Map']({'container':_0x3768('0x20'),'style':_0x3768('0x3b'),'style':_0x3768('0x4'),'style':'mapbox://styles/mapbox/navigation-preview-day-v4','style':'mapbox://styles/mapbox/cj3kbeqzo00022smj7akz3o1e','style':_0x3768('0xd'),'style':_0x3768('0x8f'),'style':'mapbox://styles/mapbox/streets-v11','style':_0x3768('0x91'),'center':[5.963833,5.243506],'zoom':15.5,'zoom':0xf,'zoom':0x7,'attribution':'Nduka\x20Okpue'}),_0x221669=L[_0x3768('0xa5')]('ArOrASno0BM9N0a3FfAOKXbzNfZA8BdB5Y7OFqbDIcbhkTiDHwmiNGfNFXoL9CTY',{'imagerySet':_0x3768('0x6b'),'maxZoom':0x1c,'detectRetina':!0x0,'retinaDpi':'d2','mapLayer':_0x3768('0x7a'),'attribution':_0x3768('0x8a')}),_0x4fc7ae=L['map']('farm_detail_map',{'zoomSnap':0.01})[_0x3768('0x64')](_0x221669)[_0x3768('0x6c')]([5.49709,5.340072],0xa),_0x860891=[];_0x3ecccc()[_0x3768('0x6a')],_0x3ecccc()[_0x3768('0x98')],_0x3ecccc()[_0x3768('0x5a')],_0x446e38['on'](_0x3768('0x3e'),function(){!function(){const _0x59c2c8=_0x860891;_0x59c2c8[_0x3768('0x79')]>0x0&&_0x574975(_0x446e38);}(),window[_0x3768('0x21')](0x0,document[_0x3768('0xa2')]['scrollTop'],{'behavior':_0x3768('0x96')});const _0x4fdeae=JSON[_0x3768('0x93')](document[_0x3768('0x1c')](_0x3768('0x48'))[_0x3768('0x7b')][_0x3768('0x22')]);console[_0x3768('0xaf')](_0x4fdeae),function(_0x294dde,_0x56da56,_0x5f3622){_0x20e541[_0x3768('0x79')]>0x0&&_0x574975(_0x294dde);const _0x26241a=turf[_0x3768('0x95')](_0x5f3622)/0x2710,_0x2289da=turf[_0x3768('0x1')](turf['centerOfMass'](_0x5f3622))[0x0],_0x5ee948=turf[_0x3768('0x89')](_0x5f3622);_0x5f3622[_0x3768('0x69')][0x0]['properties']['location'],_0x294dde[_0x3768('0x8')]({'center':_0x2289da,'zoom':0x10}),_0x294dde['fitBounds'](_0x5ee948,{'padding':0x14}),_0x56da56[_0x3768('0x6c')]([_0x2289da[0x1],_0x2289da[0x0]],13.5),new mapboxgl[(_0x3768('0x74'))]()[_0x3768('0x42')](_0x2289da)[_0x3768('0x78')](_0x294dde),_0xe9f2bb=_0x3768('0xaa');let _0xf619f5=_0x174246(_0x5f3622,{'layerID':_0xe9f2bb,'color':'#009432','thickness':0x1,'fillOpacity':null})[_0x3768('0x1f')];_0x87e50a(_0x294dde,_0xf619f5),_0xe9f2bb=_0x3768('0x39');let _0x999a6d=_0x174246(_0x5f3622,{'layerID':_0xe9f2bb,'color':_0x3768('0x9b'),'thickness':null,'fillOpacity':0.25})[_0x3768('0x4d')];_0x87e50a(_0x294dde,_0x999a6d),_0x20e541[_0x3768('0x3f')](_0xf619f5,_0x999a6d),_0x2f0351=_0x26241a;}(_0x446e38,_0x4fc7ae,_0x4fdeae),_0x4fdeae[_0x3768('0x69')][_0x3768('0x16')]((_0x34e646,_0x4b504e)=>{!function(_0x4e3e4a,_0x322e47,_0x48fcc5){let _0xe7d8b0;_0x48fcc5?(_0xe7d8b0=turf['buffer'](_0x4e3e4a,_0x48fcc5,{'unit':_0x3768('0xe')}),_0xe7d8b0=_0xe7d8b0||_0x4e3e4a):_0xe7d8b0=_0x4e3e4a;let _0x26f2e6=_0x174246(_0xe7d8b0,{'layerID':_0x322e47,'color':null,'thickness':0x2,'fillOpacity':0.1})[_0x3768('0x1f')],_0x7b8b65=_0x174246(_0xe7d8b0,{'layerID':_0x322e47,'color':null,'thickness':0x2,'fillOpacity':0.1})[_0x3768('0x4d')],_0x2a82aa=_0x4e0ebe(_0xe7d8b0,_0xe7d8b0[_0x3768('0x7e')][_0x3768('0xab')],_0xe7d8b0[_0x3768('0x7e')][_0x3768('0x71')]);_0x860891[_0x3768('0x3f')](_0x26f2e6),_0x860891[_0x3768('0x3f')](_0x7b8b65),_0x860891['push'](_0x2a82aa),_0x87e50a(_0x446e38,_0x26f2e6),_0x87e50a(_0x446e38,_0x7b8b65),_0x87e50a(_0x446e38,_0x2a82aa),_0x1efdda(_0x446e38,_0x4fc7ae,_0x7b8b65);}(_0x34e646,_0x4b504e,-0.005),console['log'](_0x34e646);});const _0x3a0e2f=_0x4fdeae[_0x3768('0x69')];_0x4fdeae['properties'][_0x3768('0x4f')],_0x4fdeae['properties'][_0x3768('0x77')],!function({parcelizedAgcGeojson:_0x276f70,farmPlotsGeojson:_0x323d63}){const _0x512325=document['getElementById'](_0x3768('0x6e')),_0x458c65=document[_0x3768('0x1c')]('map_location_overlay'),_0x5458a9=_0x276f70[_0x3768('0x7e')][_0x3768('0x3a')],_0xe2c89=[6.18,6.53];_0x512325[_0x3768('0x34')]='',_0x458c65[_0x3768('0x34')]='',_0x458c65[_0x3768('0x34')]=_0x5458a9,_0x458c65[_0x3768('0x34')]=(_0x5458a9||_0x3768('0x4b'))+'\x20'+_0xe2c89[0x0][_0x3768('0x1b')](0x5)+_0x3768('0x3d')+_0xe2c89[0x1]['toFixed'](0x5)+'°N';const _0x128665=document[_0x3768('0x50')](_0x3768('0x9c'));_0x128665[_0x3768('0x6')]='Parcelized\x20Plots\x27\x20Coordinates\x20<br><br>',_0x128665[_0x3768('0x9d')]=_0x3768('0x9f'),_0x512325['appendChild'](_0x128665),_0x512325[_0x3768('0xa9')][_0x3768('0x72')]=_0x3768('0x99'),_0x512325['style'][_0x3768('0x45')]='#f5f6fa',_0x512325['style'][_0x3768('0x37')]=_0x3768('0x9e'),_0x323d63[_0x3768('0x16')]((_0xa43478,_0x5ad018)=>{_0xa43478=turf[_0x3768('0x23')](_0xa43478,{'precision':0x5,'coordinates':0x2});const _0x252698=document[_0x3768('0x50')](_0x3768('0x9c'));_0x252698[_0x3768('0x9d')]=_0x3768('0x84'),_0x252698[_0x3768('0x6')]=_0x3768('0x54')+(_0x5ad018+0x1)+'\x20<br>\x20'+_0xa43478[_0x3768('0x7e')]['farmer_id'][_0x3768('0x1a')]()+_0x3768('0x2d')+JSON['stringify'](_0xa43478[_0x3768('0x5c')][_0x3768('0x59')])+_0x3768('0x27'),_0x512325[_0x3768('0x30')](_0x252698);});}({'parcelizedAgcGeojson':_0x4fdeae,'farmPlotsGeojson':_0x3a0e2f});});}]);