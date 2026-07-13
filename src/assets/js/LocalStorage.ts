export function setLocale (lang:string) {
    return localStorage.setItem('locale' , lang );
}

export function getLocale () {
    const locale = localStorage.getItem('locale')   ;
    if(!locale) { return 'ar'}
    return locale; 
}

export const setJWToken = ( token , expiry = null ) => {
    window.localStorage.setItem('jwt_token' , token ) ;
    if( null == expiry) { return ; }
    window.localStorage.setItem('jwt_token_expiry', expiry ) ;
}

export const getJWToken = () => {
    return window.localStorage.getItem('jwt_token')
}

export const setUser = ( user ) => {
    if(user == undefined || typeof user == 'undefined'){
        return false ;
    }
    window.localStorage.setItem('user', JSON.stringify(user)) ;
}


export const getUser = () => {
    
    const user  = window.localStorage.getItem('user'); 
    if( user == 'undefined'  || user == 'null' ) {
        window.localStorage.removeItem('user') ;
        return null ;
    }

    return JSON.parse(user);

}

export const setProfilePhotoLink = (link)=> {
    if(link == undefined || typeof link == 'undefined'){
        return false ;
    }
    window.localStorage.setItem('profile_photo_link',  link ) ;
}

export const getProfilePhotoLink = () => {
    const link = window.localStorage.getItem('profile_photo_link'); 
    if( link == 'undefined'  || link == 'null' ) {
        window.localStorage.removeItem('profile_photo_link') ;
        return null ;
    }
 
    return link;
}

export const destroyUser = () =>{
     window.localStorage.removeItem('user') ;
     window.localStorage.removeItem('profile_photo') ;
}

export const distroySession = () =>{
    window.localStorage.clear();
}


export default {
    distroySession, 
    setJWToken,  getJWToken,
    getLocale, setLocale ,
    getUser, setUser , getProfilePhotoLink, setProfilePhotoLink, destroyUser,
    
}