<script lang="ts">
import { onMounted,ref , toRef } from 'vue';
import { useField } from 'vee-validate'; 

const GMAP_API =  import.meta.env.VITE_GMAP_API;
 
(g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
    key: GMAP_API,
    v: "weekly", 
  });

export default {
    props :{
        name : {
            type : String,
            required : true
        },
        value : {
            type : String ,
            default : undefined  
        },
        mapOptions : {
            type: Object,
            default : {
                center: {lat: 25.0693675, lng: 45.4035927 },
                zoom: 5
            }
        }
         
 
    },
    setup (props , context ) {
        // const  = ref( false ) ;
        defineProps({
            latLng: {
                type: String,
                required : true,
                
            }
        });

        const name = toRef(props, 'name');
        const latLng = toRef(props, 'value'); 


        const mapDiv    = ref(null); 

        function setMarker(marker , map ){

        } 
  
        async function initMap(): Promise<void> {

       

            try{

                const { Map  } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
                const { AdvancedMarkerElement } = await google.maps.importLibrary('marker') as google.maps.MarkerLibrary;
                
                const map = new Map( mapDiv.value as HTMLElement ,{ 
                    ... props.mapOptions ,
                     mapId: name+'map-picker' 

                }) ;

                const marker = new AdvancedMarkerElement({
                    map: map,
                    position:props.mapOptions.center,
                    gmpDraggable: true,
                    title: "Saudi Arabia",
                });

                marker.addListener('dragend', (event) => {
                    const position = marker.position ;
                    
                    console.log(  marker.position.lat ,   marker.position.lat);
                    latLng.value = marker.position.lat.toFixed(7) +', '+ marker.position.lng.toFixed(7);

                });

            }catch(err){
                console.log(err);
            }
        }

        onMounted( async ()=>{

            initMap();
 
        });
 
        return { 
            mapDiv,
            latLng
        }
    }
}


 
</script>
<template>
    <div>
        <div 
            ref="mapDiv"
            :id="name+'map-picker'"
            class="w-100 "
            style="min-height: 420px;"
            > 
        </div>
    </div>

</template>
 
