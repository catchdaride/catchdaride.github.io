// Interchange Directory & Transit Hubs for BusMap
const POIS_DATA = {
  thePinesBays: [
    { bay: "Bay 1", routes: ["905", "908"], title: "City via Eastern Freeway (DART Express)", platform: "Main Bay 1", lat: -37.76282, lon: 145.16815 },
    { bay: "Bay 2", routes: ["906"], title: "City & Warrandyte via Blackburn Rd (DART Express)", platform: "Main Bay 2", lat: -37.76280, lon: 145.16820 },
    { bay: "Bay 3", routes: ["305", "309"], title: "Peak Express to Melbourne CBD", platform: "Main Bay 3", lat: -37.76278, lon: 145.16825 },
    { bay: "Bay 4", routes: ["273", "295"], title: "Nunawading Station & Westfield Doncaster", platform: "Main Bay 4", lat: -37.76275, lon: 145.16830 },
    { bay: "Bay 5", routes: ["280", "282"], title: "Manningham Mover Circular Loops", platform: "Main Bay 5", lat: -37.76272, lon: 145.16835 },
    { bay: "Bay 6", routes: ["901"], title: "SmartBus Orbital (Melbourne Airport <-> Frankston)", platform: "Reynolds Rd Platform", lat: -37.76285, lon: 145.16810 }
  ],
  majorHubs: [
    { id: "hub-pines", name: "The Pines Shopping Centre", subtitle: "Blackburn Rd & Reynolds Rd Interchange", lat: -37.76282, lon: 145.16815, type: "interchange" },
    { id: "hub-doncaster", name: "Westfield Doncaster", subtitle: "Doncaster Rd & Williamsons Rd Interchange", lat: -37.7842, lon: 145.1248, type: "shopping" },
    { id: "hub-boxhill", name: "Box Hill Central", subtitle: "Train, Tram 109 & Bus Interchange", lat: -37.8188, lon: 145.1215, type: "multimodal" },
    { id: "hub-cbd", name: "Melbourne CBD (Lonsdale & King St)", subtitle: "City Express Bus Terminus", lat: -37.8125, lon: 144.9620, type: "city" },
    { id: "hub-nunawading", name: "Nunawading Station", subtitle: "Belgrave & Lilydale Train Line", lat: -37.8202, lon: 145.1760, type: "station" },
    { id: "hub-mitcham", name: "Mitcham Station", subtitle: "Belgrave & Lilydale Train Line", lat: -37.8180, lon: 145.1970, type: "station" },
    { id: "hub-ringwood", name: "Ringwood Station", subtitle: "Train & Bus Transit Interchange", lat: -37.8156, lon: 145.2286, type: "station" },
    { id: "hub-airport", name: "Melbourne Airport (Tullamarine)", subtitle: "SkyBus & Route 901 Terminus", lat: -37.6690, lon: 144.8410, type: "airport" }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = POIS_DATA;
}
