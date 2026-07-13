const BASE_URL = "/";
const rawCardPath = "platform/media/applications/licens-card-raw-front.svg";

export function fillCardData() {}

export const textlicenseCardSVG = function () {
  return fetch(BASE_URL + rawCardPath)
    .then((response) => response.blob())
    .then((file) => file.text());

  // let fileReader = new FileReader() ;

  // fileReader.addEventListener('load' , (e)=>{
  //     cardText  = e.target.result ;
  //     console.log(cardText);
  //     fillCardData();
  // });
  // console.log(BASE_URL+rawCardPath );
  // fileReader.readAsText( BASE_URL+rawCardPath )   ;
};

export default {
  textlicenseCardSVG,
};
