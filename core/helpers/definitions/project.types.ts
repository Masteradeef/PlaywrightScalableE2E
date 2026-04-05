export enum ProjectType {
  EN_DESKTOP_CHROME = 'en-desktop-chrome',
  EN_MOBILE_SAFARI = 'en-mobile-safari',
  FR_DESKTOP_CHROME = 'fr-desktop-chrome',
  FR_MOBILE_SAFARI = 'fr-mobile-safari'
}

export enum Language {
  EN = 'en',
  FR = 'fr'
}

export enum Device {
  DESKTOP = 'desktop',
  MOBILE = 'mobile'
}

export enum Browser {
  CHROME = 'chrome',
  SAFARI = 'safari'
}

export interface ProjectContext {
  type: ProjectType;
  language: Language;
  device: Device;
  browser: Browser;
}

export interface LocatorDefinition {
  selector: string;
  description?: string;
  timeout?: number;
}

export interface LocatorSet {
  [key: string]: LocatorDefinition | string;
}

export interface TestData {
  [key: string]: any;
}

export interface PageConfiguration {
  url: string;
  title: string;
  elements: LocatorSet;
}

export interface ActionResult {
  success: boolean;
  message?: string;
  data?: any;
}

export enum FilterType {
  Location = 'Location',
  MakeModelTrim = 'Make, Model, Trim',
  Price = 'Price'
}

export enum RadiusType {
  Provincial = 'Provincial',
  Nationwide = 'Nationwide',
  TwentyFiveKm = '25 km',
  FiftyKm = '50 km',
  HundredKm = '100 km',
  TwoFiftyKm = '250 km',
  FiveHundredKm = '500 km',
  ThousandKm = '1000 km'
}

export enum PageType {
  HomePage = 'homePage',
  ListPage = 'listPage',
  VehicleDetailPage = 'vehicleDetailPage',
  FavouritesPage = 'favouritesPage',
  AfterLeadPage = 'afterLeadPage',
  DealerWebsiteWidgetPage = 'dealerWebsiteWidgetPage',
  ETIForm = 'etiForm',
  MLCPage = 'mlcPage',
  ListingsPage = 'listingsPage',
  PPPPage = 'pppPage',
  Shared = 'shared'
}

export enum LegacyRadiusType {
  Provincial = 'Provincial',
  National = 'National',
  TwentyFiveKm = '+25 km',
  FiftyKm = '+50 km',
  HundredKm = '+100 km',
  TwoFiftyKm = '+250 km',
  FiveHundredKm = '+500 km',
  ThousandKm = '+1,000 km'
}

export enum VehicleConditionType {
  New = 'New|Neuf',
  Used = 'Used|Occasion',
  Damaged = 'Damaged|Endommagé',
  CertifiedPreOwned = 'Certified pre-owned|Véhicules Certifiés'
}

export enum YesNoType {
  Yes = 'Yes|Oui',
  No = 'No|Non'
}

export enum ICOQuestionnaireAnswerType {
  AreYouTheOriginalOwner = 'Are you the original owner?|Êtes-vous le propriétaire d\'origine?',
  AreYouStillMakingPaymentsOnYourVehicle = 'Are you still making payments on your vehicle?|Effectuez-vous encore des paiements?',
  AreYouInterestedInBuyingAReplacementVehicle = 'Are you interested in buying a replacement vehicle?|Êtes-vous intéressé par l\'achat d\'un véhicule de remplacement?',
  WasYourCarEverInAnAccident = 'Was your car ever in an accident?|Votre véhicule a-t-il déjà été impliqué dans un accident ?',
  DoesYourCarHaveABadHistoryReport = 'Does your car have a bad history report? (e.g. CARFAX®)|Votre véhicule a-t-il un rapport d\'historique défavorable ? (ex: CARFAX®)',
  DoesYourCarHaveAnyExistingExteriorDamage = 'Does your car have any existing exterior damage?|Votre véhicule a-t-il des dommages extérieurs existants ?',
  DoesYourCarHaveAnyExistingInteriorDamage = 'Does your car have any existing interior damage?|Votre véhicule a-t-il des dommages intérieurs existants ?',
  WhatIsTheConditionOfYourCarsFrontTires = 'What is the condition of your car\'s front tires?|Quelle est la condition de vos pneus avant ?',
  WhatIsTheConditionOfYourCarsRearTires = 'What is the condition of your car\'s rear tires?|Quelle est la condition de vos pneus arrière ?',
  DoesYourCarHaveAnyMechanicalIssues = 'Does your car have any mechanical issues?|Votre véhicule a-t-il des problèmes mécaniques ?',
  DoesYourCarHaveAnyIlluminatedWarningLights = 'Does your car have any illuminated warning lights?|Votre véhicule a-t-il des témoins d\'avertissement allumés ?',
  DoesYourCarHaveAnyModifications = 'Does your car have any modifications?|Votre véhicule a-t-il été modifié ?',
  DoesYourCarHaveAnyOdors = 'Does your car have any odors (smoke, pet, etc)?|Votre véhicule a-t-il des odeurs (fumée, animaux, etc.) ?',
  DoesYourCarHaveAnyOtherIssues = 'Does your car have any other issues?|Votre véhicule a-t-il d\'autres problèmes ?',
  WhenDoPlanToSellYourVehicle = 'When do plan to sell your vehicle?|Délai de vente prévu pour le véhicule actuel',
  BestTimeToContactMe = 'Best time to contact me.|Horaire préféré pour être contacté'
}

export enum InteriorExteriorDamageType {
  Minor = 'Minor|mineur',
  Moderate = 'Moderate|modéré',
  Extensive = 'Extensive|étendu',
  None = 'None|Aucun'
}

export enum TyreConditionType {
  Excellent = 'Excellent',
  Good = 'Good|Bon',
  Poor = 'Poor|Mauvais'
}

export enum SellTimeframeType {
  ReadyToSell = 'I\'m ready to sell my car and I\'m comparing options|Je suis prêt à vendre ma voiture et je compare les options',
  WithinTwoToSixMonths = 'I\'m planning to sell my car within 2-6 months|Je prévois de vendre ma voiture dans 2 à 6 mois',
  JustCurious = 'I\'m just curious about what is my car worth|Je suis juste curieux de connaître la valeur de ma voiture'
}

export enum BestContactTimeType {
  Morning = 'Morning (9am - 12pm)|Matin (9h - 12h)',
  Afternoon = 'Afternoon (12pm - 4pm)|Après-midi (12h - 16h)',
  Evening = 'Evening (4pm - 8pm)|Soirée (16h - 20h)'
}

export enum PaintConditionType {
  LikeNew = '1. Like new|1. Comme neuf',
  ProfessionallRepaired = '2. Professionally repaired|2. Réparé professionnellement',
  NonRepairedWearOrDamage = '3. Non-repaired wear or damage|3. Usure ou dommages non réparés'
}

export enum BodyWorkMechanicalConditionType {
  CompletelyDamageFree = '1. Completely damage-free|1. Comme neuf / Complètement sans dommage ',
  ProfessionallRepaired = '2. Professionally repaired|2. Réparé professionnellement',
  NonRepairedWearOrDamage = '3. Non-repaired wear or damage|3. Usure ou dommage non réparé',
  NotRoadworthy = '4. Not roadworthy|4. Non roulant'
}

export enum HasYourCarEverBeenInAnAccidentType {
  Yes = 'Yes|Oui',
  No = 'No|Non'
}

export enum VINMakeAndModelTabType {
  VIN = 'VIN|NIV',
  MakeAndModel = 'Make & Model|Marque et modèle'
}


export enum MarketplaceType {
  OneMarketplace = 'OneMarketplace',
  LegacyTrader = 'LegacyTrader'
}

export enum ListingTabType {
  VehicleData = 'Vehicle data*|Données du véhicule*',
  Features = 'Features*|Caractéristiques*',
  Condition = 'Condition*|État du véhicule*',
  Equipment = 'Equipment|Équipement',
  Drivetrain = 'Drivetrain|Traction',
  Images = 'Images|Photos',
  Description = 'Description|Description',
  Price = 'Price*|Prix*',
  Contact = 'Contact*|Contact*'
}

export enum UnknownYesNoType {
  Unknown = 'Unknown|Inconnu',
  Yes = 'Yes|Oui',
  No = 'No|Non'
}

export enum CAndRQuestionnaireType {
  IsTheVehicleDamaged = 'Is the vehicle damaged?|Véhicule endommagé?',
  AccidentVehicle = 'Accident vehicle|Accidenté',
  Roadworthy = 'Roadworthy|Pas en état de marche',
  IsCabinClean = 'Is the cabin clean?|La cabine est-elle propre ?',
  AddAsContactOptionInTheListing = 'Add as a contact option in the listing?*|Ajouter dans l\'annonce comme contact?*'
}

export enum CAndRDropdownType {
  Brand = 'Brand*|Marque*',
  Model = 'Model*|Modèle*',
  ModelYear = 'Model year*|Année modèle',
  BodyStyle = 'Body style|Type de carrosserie',
  NumberOfPassengers = 'Number of passengers|Nombre de passagers',
  NumberOfDoors = 'Number of doors|Nombre de portes',
  SleepingCapacity = 'Sleeping Capacity|Capacité de couchage',
  SlideOutCount = 'Slide-Out Count|Nombre de sections dépliables',
  InteriorTrim = 'Interior trim|Finition intérieure',
  ExteriorMaterial = 'Exterior Material|Matériau extérieur',
  BedType = 'Bed Type|Type de lit',
  RefrigeratorPowerType = 'Refrigerator Power Type|Type d\'alimentation du réfrigérateur',
  InteriorFlooringMaterial = 'Interior Flooring Material|Matériau de revêtement intérieur',
  VehicleCondition = 'Vehicle condition*|État du véhicule*',
  AlloyWheels = 'Alloy wheel size|Jantes en alliage',
  VehicleOwners = 'Vehicle owners|Nombre de propriétaires',
  FuelType = 'Fuel type|Type carburant',
  DriveType = 'Drive type|Type de traction',
  Transmission = 'Transmission|Transmission',
  Gears = 'Gears|Vitesses',
  Cylinders = 'Cylinders|Cylindres',
  BrakeType = 'Brake Type|Type de frein',  
  NumberOfToilets = 'Number of Toilets|Nombre de toilettes',
  SteeringType = 'Steering Type|Type de direction',
  AuxiliaryPower = 'Auxiliary Power|Alimentation auxiliaire',
  HullMaterial = 'Hull Material|Matériau de la coque',
  EngineMountingType = 'Engine Mounting Type|Type de montage du moteur',
  NumberOfEngines = 'Number of Engines|Nombre de moteurs',
  FuelDeliveryType = 'Fuel Delivery Type|Type de distribution de carburant',
  EngineCoolingSystem = 'Engine Cooling System|Système de refroidissement du moteur'
}

export enum CAndRCheckboxType {
  Metallic = 'Metallic|Métallisé',
  
  // Equipment  
  Bucket = 'Bucket|Bucket',
  Cab = 'Cab|Cab',  
  ElectricStarter = 'Electric Starter|Démarreur électrique',
  HotBarEnd = 'Hot bar end|Poignées chauffantes',
  Trailer = 'Trailer|Trailer',

  ServiceBookMaintained = 'Service book maintained|Carnet d\'entretien à jour',
  NonSmokerVehicle = 'Non-smoker vehicle|Véhicule non-fumeur',

  // Air condition
  AirConditioning = 'Air conditioning|Climatiseur',
  AutomaticClimateControl = 'Automatic climate control|Climatisation automatique',
  AutomaticClimateControlDualZone = 'Automatic Climate Control, Dual-Zone|Climatisation automatique bi-zone',
  
  // Airbag
  DriverSideAirbag = 'Driver-side airbag|Airbag côté conducteur',
  PassengerSideAirbag = 'Passenger-side airbag|Airbag côté passager',
  SideAirbag = 'Side airbag|Airbag latéral',
  
  // Assistance systems
  BlindSpotMonitor = 'Blind spot monitor|Système de surveillance des angles morts',
  FrontCollisionWarning = 'Front Collision Warning|Système d\'alerte de distance',
  LaneDepartureWarningSystem = 'Lane departure warning system|Système d\'alerte de franchissement de ligne',
  TrafficSignRecognition = 'Traffic sign recognition|Reconnaissance des panneaux de signalisation',
  
  // Central locks
  PowerDoorLocks = 'Power Door Locks|Système d\'accès sans clé',
  RemoteKeylessEntry = 'Remote Keyless Entry|Accès sans clé à distance',
  
  // Comfort
  AirSuspension = 'Air suspension|Suspension pneumatique',
  Armrest = 'Armrest|Accoudoir',
  HeadsUpDisplay = 'Heads-up display|Affichage tête haute',
  HeatedSteeringWheel = 'Heated steering wheel|Volant chauffant',
  LeatherSteeringWheel = 'Leather steering wheel|Volant en cuir',
  PanoramicRoof = 'Panoramic Roof|Toit panoramique',
  PowerMirrors = 'Power Mirrors|Rétroviseurs électriques',
  PowerSteering = 'Power steering|Direction assistée',
  PowerWindows = 'Power windows|Vitres électriques',
  RainSensingWipers = 'Rain Sensing Wipers|Capteur de pluie',
  SlidingDoor = 'Sliding door|Porte coulissante',
  StartStopSystem = 'Start-stop system|Système start-stop',
  SunMoonroof = 'Sun/Moonroof|Toit ouvrant',
  
  // Cruise control
  AdaptiveCruiseControl = 'Adaptive Cruise Control|Régulateur de vitesse adaptatif',
  CruiseControl = 'Cruise control|Régulateur de vitesse',
  
  // Entertainment
  AppleCarPlay = 'Apple CarPlay|Apple CarPlay',
  DigitalCockpit = 'Digital cockpit|Cockpit numérique',
  IntegratedMusicStreaming = 'Integrated music streaming|Streaming musical intégré',
  SoundSystem = 'Sound system|Système audio',
  Television = 'Television|Télévision',
  VoiceControl = 'Voice Control|Commande vocale',
  WirelessCharging = 'Wireless Charging|Recharge sans fil',
  
  // Extras
  AlloyWheels = 'Alloy wheels|Jantes en alliage',
  AmbientLighting = 'Ambient lighting|Éclairage d\'ambiance',
  AutoDimmingRearviewMirror = 'Auto Dimming Rearview Mirror|Rétroviseur intérieur à atténuation automatique',
  Awning = 'Awning|Auvent',
  BunkBed = 'Bunk bed|Lits superposés',
  CableWinch = 'Cable winch|Treuil',
  RoofRack = 'Roof rack|Barres de toit',
  SatelliteAntenna = 'Satellite antenna|Antenne satellite',
  SeparateShower = 'Separate shower|Douche séparée',
  Skirt = 'Skirt|Jupe isolante',
  SpareTire = 'Spare Tire|Roue de secours',
  TintedWindows = 'Tinted windows|Vitres teintées',
  TrailerHitch = 'Trailer hitch|Attelage de remorque',
  WC = 'WC|WC',
  BilgePump = 'Bilge pump|Bilge pump',
  ConvertibleTopBimini = 'Convertible top/bimini|Convertible top/bimini',
  Jacob = 'Jacob|Frein Jake',
  RearSpoiler = 'Rear Spoiler|Aileron',
  SleepingBerth = 'Sleeping berth|Couchette',
  
  // Infotainment
  AmFmStereo = 'AM/FM Stereo|Radio AM/FM',
  BluetoothConnection = 'Bluetooth Connection|Interface Bluetooth',
  CdPlayer = 'CD player|Lecteur CD',
  Mp3Player = 'MP3 Player|Lecteur MP3',
  NavigationSystem = 'Navigation system|Système de navigation',
  OnBoardComputer = 'On-board computer|Ordinateur de bord',
  SteeringWheelAudioControls = 'Steering Wheel Audio Controls|Volant multifonction',
  
  // Lights
  AutoLevelingHeadlights = 'Auto-leveling Headlights|Phares adaptatifs',
  BiXenonHeadlights = 'Bi-Xenon headlights|Phares bi-xénon',
  DaytimeRunningLights = 'Daytime running lights|Lumières de jour',
  FogLights = 'Fog lights|Phares antibrouillard',
  FullLedHeadlights = 'Full-LED headlights|Phares entièrement LED',
  LedDaytimeRunningLights = 'LED Daytime Running Lights|Lumières de jour aux LED',
  
  // Parking assistance
  Camera360 = '360° camera|Caméra 360°',
  BackUpCamera = 'Back-Up Camera|Caméra du système d\'aide au stationnement',
  ParkingAssistRearSensors = 'Parking Assist Rear Sensors|Capteurs arrière d\'aide au stationnement',
  
  // Seats
  CooledSeats = 'Cooled Seats|Sièges ventilés',
  HeatedSeats = 'Heated Seats|Sièges chauffants',
  PowerSeats = 'Power Seats|Sièges électriques',
  SplitBenchSeat = 'Split Bench Seat|Sièges arrière fractionnés',
  
  // Security
  AlarmSystem = 'Alarm system|Système d\'alarme',
  AntiLockBrakingSystemABS = 'Anti-lock braking system (ABS)|Système de freinage antiblocage (ABS)',
  ElectronicStabilityControl = 'Electronic stability control|Contrôle électronique de stabilité',
  EngineImmobilizer = 'Engine Immobilizer|Anti-démarreur',
  TractionControl = 'Traction control|Contrôle de traction',

  // Price
  Negotiable = 'Negotiable|Négociable'
}

export enum CAndRTextInputType {
  //Vehicle Data
  ModelName = 'Model name*|Nom du modèle*',
  MarketingTrim = 'Marketing trim|Version marketing du modèle',
  VehicleIdentificationNumberVIN = 'Vehicle identification number (VIN)|Numéro d\'identification du véhicule (NIV)',

  // Features
  VehicleEmptyWeight = 'Vehicle empty weight|Poids à vide du véhicule',
  SkiStance = 'Ski Stance|Écartement des skis',
  TrackDimension = 'Track Dimension|Dimension de la chenille',
  Location = 'Location|Emplacement',
  ChassisManufacturerName = 'Chassis Manufacturer Name|Nom du fabricant du châssis',
  FridgeCapacity = 'Fridge capacity|Capacité du réfrigérateur',
  HoldingTankCapacity = 'Holding tank capacity|Capacité du réservoir de rétention',
  WasteTankCapacity = 'Waste tank capacity|Capacité du réservoir de rétention',
  WaterTankCapacity = 'Water tank capacity|Capacité du réservoir d\'eau',
  TotalLength = 'Total length|Longueur totale (pi)',
  TotalWidth = 'Total width|Largeur totale (pi)',
  RVLength = 'RV Length|Longueur du VR',

  // Condition
  Mileage = 'Mileage|Kilométrage',
  VehicleOperatingHours = 'Engine operating hours|Heures de fonctionnement',
  EngineOperatingHours = 'Engine operating hours|Heures de fonctionnement',
  

  // Drivetrain
  PowerHP = 'Power (HP)|Puissance (chevaux)',
  EngineCapacity = 'Engine Capacity|Cylindrée',
  AxleSpread = 'Axle Spread|Écartement d\'essieux',
  FrameType = 'Frame Type|Type de châssis',
  EngineMarketingDescription = 'Engine Marketing Description|Description marketing du moteur',
  FrontAxleCapacity = 'Front Axle Capacity|Capacité de l\'essieu avant',
  RearAxleCapacity = 'Rear Axle Capacity|Capacité de l\'essieu arrière',
  DifferentialRatio = 'Differential Ratio|Rapport de différentiel',
  FuelCapacity = 'Fuel Capacity|Capacité du réservoir de carburant',
  OilCapacity = 'Oil Capacity|Capacité d\'huile',
  Wheelbase = 'Wheelbase|Empattement',
  CabToAxle = 'Cab to Axle|Distance cabine-essieu',
  EngineControlModule = 'Engine Control Module|Module de contrôle du moteur',
  EngineManufacturerName = 'Engine Manufacturer Name|Nom du fabricant du moteur',

  // Price
  YourOfferPriceForYourVehicle = 'Your offer price for your vehicle:*|Prix demandé pour votre véhicule:*',

  // Contact
  FirstName = 'First name*|Prénom*',
  LastName = 'Last name*|Nom de famille*',
  PostalCode = 'Postal code*|Code postal*',
  AreaCode = 'Area code|Code régional',
  PhoneNumber = 'Phone number|N° téléphone'  
}

export enum CAndRColorType {
  ExteriorColor = 'Exterior color|Couleur de la carrosserie',
  InteriorColor = 'Interior color|Couleur de l\'habitacle'
}














