import { MapContainer, TileLayer } from 'react-leaflet'


const HomePage = () => {

	return (
		<MapContainer className="w-screen h-screen" center={[-25.5543733, -54.576612]} zoom={13} >
			<TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution='Tiles © Esri, Maxar, Earthstar Geographics'
      />
      <TileLayer
        url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
        attribution='Labels © Esri'
      />
		</MapContainer>
	)
};

export default HomePage;