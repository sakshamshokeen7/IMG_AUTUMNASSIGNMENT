import {useParams} from 'react-router-dom';
const EventGalleryPage=()=>{
    const {eventId}=useParams<{eventId:string}>();
    return <div>Event Gallery Page for Event ID: {eventId}</div>;
};
export default EventGalleryPage;