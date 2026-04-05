import { test, expect, Page } from '@playwright/test';
import { OperationHandler } from '../../core/operations/OperationHandler';
import { getTestData, ProjectContextManager } from '../../core/helpers/settings/projectContext';
import { CookieHelper } from '../../core/helpers/utilities/cookieHelper';
import { 
  Language, 
  PageType, 
  CAndRDropdownType, 
  CAndRTextInputType, 
  CAndRCheckboxType,   
  CAndRColorType,
  CAndRQuestionnaireType,
  UnknownYesNoType,  
} from '../../core/helpers/definitions/project.types';
import { DesktopMLCPageActions } from '../../core/operations/desktop/desktop.mlcPage.actions';
import { MobileMLCPageActions } from '../../core/operations/mobile/mobile.mlcPage.actions';
import { DesktopListingsPageActions } from '../../core/operations/desktop/desktop.listingsPage.actions';
import { MobileListingsPageActions } from '../../core/operations/mobile/mobile.listingsPage.actions';
import { DesktopPPPPageActions } from '../../core/operations/desktop/desktop.pppPage.actions';
import { MobilePPPPageActions } from '../../core/operations/mobile/mobile.pppPage.actions';
import { DesktopSharedActions } from '../../core/operations/desktop/desktop.shared.actions';
import { MobileSharedActions } from '../../core/operations/mobile/mobile.shared.actions';
import testDataRaw from '../inputdata/testdata.json';

const testData = structuredClone(testDataRaw);

// Global test variables
let page: Page;
let language: Language;
let context: any;
let cookieHelper: CookieHelper;
let mlcPageActions: DesktopMLCPageActions | MobileMLCPageActions;
let listingsPageActions: DesktopListingsPageActions | MobileListingsPageActions;
let pppPageActions: DesktopPPPPageActions | MobilePPPPageActions;
let sharedActions: DesktopSharedActions | MobileSharedActions;

test.describe.serial('A Logged-in User ', () => {

  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'en-desktop-chrome', 'Skipped: only runs on EN Desktop Chrome');
  });

  test.beforeAll(async ({ browser }, workerInfo) => {
    const projectContext = ProjectContextManager.getInstance();
    projectContext.setContext(workerInfo.project.name as any);
    context = projectContext.getContext();
    language = projectContext.getLanguage();

    page = await browser.newPage();
    cookieHelper = new CookieHelper(page);
    await cookieHelper.addAllCommonCookies();

    mlcPageActions = OperationHandler.createActions(page, PageType.MLCPage);
    listingsPageActions = OperationHandler.createActions(page, PageType.ListingsPage);
    pppPageActions = OperationHandler.createActions(page, PageType.PPPPage);
    sharedActions = OperationHandler.createActions(page, PageType.Shared);

    await sharedActions.navigateToUrl('/');
    await sharedActions.signIn(
          getTestData(testData.credentials).username,
          getTestData(testData.credentials).password
        );
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('should create a Car (C) listing - Test 1', async () => {
    // Increase timeout for mobile Safari form population test
    test.setTimeout(300000); // 5 minutes

    await sharedActions.navigateToUrl(testData.MLC.desktop.en.Test1.url);

    const vehiclesTab = [
        { field: CAndRDropdownType.Brand, value: testData.MLC.desktop.en.Test1.make },
        { field: CAndRDropdownType.Model, value: testData.MLC.desktop.en.Test1.model },
        { field: CAndRTextInputType.MarketingTrim, value: testData.MLC.desktop.en.Test1.trim },
        { field: CAndRDropdownType.ModelYear, value: testData.MLC.desktop.en.Test1.year },        
    ]

    const featuresTab = [
        { field: CAndRDropdownType.BodyStyle, value: testData.MLC.desktop.en.Test1.bodyStyle },
        { field: CAndRDropdownType.NumberOfPassengers, value: testData.MLC.desktop.en.Test1.numberOfPassengers },
        { field: CAndRDropdownType.NumberOfDoors, value: testData.MLC.desktop.en.Test1.numberOfDoors },
        { field: CAndRColorType.ExteriorColor, value: testData.MLC.desktop.en.Test1.exteriorColor },
        { field: CAndRCheckboxType.Metallic, value: true },
        { field: CAndRDropdownType.InteriorTrim, value: testData.MLC.desktop.en.Test1.interiorTrim },
        { field: CAndRColorType.InteriorColor, value: testData.MLC.desktop.en.Test1.interiorColor },
        { field: CAndRTextInputType.VehicleEmptyWeight, value: testData.MLC.desktop.en.Test1.vehicleEmptyWeight }
    ]

    const conditionTab = [
        { field: CAndRDropdownType.VehicleCondition, value: testData.MLC.desktop.en.Test1.vehicleCondition },
        { field: CAndRTextInputType.Mileage, value: testData.MLC.desktop.en.Test1.mileage },
        { field: CAndRDropdownType.VehicleOwners, value: testData.MLC.desktop.en.Test1.vehicleOwners },
        { field: CAndRCheckboxType.ServiceBookMaintained, value: true },
        { field: CAndRCheckboxType.NonSmokerVehicle, value: true },
        { field: CAndRQuestionnaireType.IsTheVehicleDamaged, value: UnknownYesNoType.Yes },
        { field: CAndRQuestionnaireType.AccidentVehicle, value: UnknownYesNoType.No },
        { field: CAndRQuestionnaireType.Roadworthy, value: UnknownYesNoType.Unknown },        
    ]

    const equipmentTab = [
        { field: CAndRCheckboxType.AirConditioning, value: true },        
        { field: CAndRCheckboxType.DriverSideAirbag, value: true },
        { field: CAndRCheckboxType.PassengerSideAirbag, value: true },
        { field: CAndRCheckboxType.SideAirbag, value: true },
        { field: CAndRCheckboxType.BlindSpotMonitor, value: true },        
        { field: CAndRCheckboxType.PowerDoorLocks, value: true },        
        { field: CAndRCheckboxType.LeatherSteeringWheel, value: true },        
        { field: CAndRCheckboxType.PowerSteering, value: true },
        { field: CAndRCheckboxType.PowerWindows, value: true },        
        { field: CAndRCheckboxType.CruiseControl, value: true },        
        { field: CAndRCheckboxType.SoundSystem, value: true },        
        { field: CAndRCheckboxType.SpareTire, value: true },        
        { field: CAndRCheckboxType.BluetoothConnection, value: true },        
        { field: CAndRCheckboxType.FogLights, value: true },        
        { field: CAndRCheckboxType.LedDaytimeRunningLights, value: true },        
        { field: CAndRCheckboxType.BackUpCamera, value: true },        
        { field: CAndRCheckboxType.HeatedSeats, value: true },        
        { field: CAndRCheckboxType.TractionControl, value: true },
    ]

    const drivetrainTab = [
        { field: CAndRDropdownType.FuelType, value: testData.MLC.desktop.en.Test1.fuelType },
        { field: CAndRDropdownType.DriveType, value: testData.MLC.desktop.en.Test1.driveType },
        { field: CAndRDropdownType.Transmission, value: testData.MLC.desktop.en.Test1.transmission },
        { field: CAndRTextInputType.PowerHP, value: testData.MLC.desktop.en.Test1.powerHP },        
        { field: CAndRDropdownType.Gears, value: testData.MLC.desktop.en.Test1.gears },
        { field: CAndRDropdownType.Cylinders, value: testData.MLC.desktop.en.Test1.cylinders },
        { field: CAndRTextInputType.EngineCapacity, value: testData.MLC.desktop.en.Test1.engineCapacity }
    ]

    const priceTab = [
        { field: CAndRTextInputType.YourOfferPriceForYourVehicle, value: testData.MLC.desktop.en.Test1.offeringPrice },
        { field: CAndRCheckboxType.Negotiable, value: true }
    ]

    const contactTab = [
        { field: CAndRTextInputType.FirstName, value: testData.MLC.desktop.en.Test1.firstName },
        { field: CAndRTextInputType.LastName, value: testData.MLC.desktop.en.Test1.lastName },
        { field: CAndRTextInputType.PostalCode, value: testData.MLC.desktop.en.Test1.postalCode },
        { field: CAndRTextInputType.AreaCode, value: testData.MLC.desktop.en.Test1.areaCode },
        { field: CAndRTextInputType.PhoneNumber, value: testData.MLC.desktop.en.Test1.phoneNumber },
        { field: CAndRQuestionnaireType.AddAsContactOptionInTheListing, value: UnknownYesNoType.No }
    ]

    // Use the fillVehicleData function to fill basic vehicle data
    await mlcPageActions.fillVehicleData(vehiclesTab);
    await mlcPageActions.fillFeatures(featuresTab);
    await mlcPageActions.fillCondition(conditionTab);
    await mlcPageActions.fillEquipment(equipmentTab);
    await mlcPageActions.fillDrivetrain(drivetrainTab);
    await mlcPageActions.fillDescription(testData.MLC.desktop.en.Test1.description);
    await mlcPageActions.fillPrice(priceTab);
    await mlcPageActions.fillContact(contactTab);
    await mlcPageActions.clickPublishButton();
    await pppPageActions.clickMayBeLaterLink();

    const price = await listingsPageActions.getPrice();
    const makeModel = await listingsPageActions.getMakeModel();
    const trim = await listingsPageActions.getTrim();
    const otherDetails = await listingsPageActions.getOtherDetails();
    const expectedMakeModel = testData.MLC.desktop.en.Test1.make + ' ' + testData.MLC.desktop.en.Test1.model;
    const expectedMileage = Number(testData.MLC.desktop.en.Test1.mileage).toLocaleString('en-CA');

    expect(price, `Expected listing price to be "${testData.MLC.desktop.en.Test1.offeringPrice}" but got "${price}"`).toBe(testData.MLC.desktop.en.Test1.offeringPrice);
    expect(makeModel, `Expected listing make and model to be "${expectedMakeModel}" but got "${makeModel}"`).toBe(expectedMakeModel);
    expect(trim, `Expected listing trim to be "${testData.MLC.desktop.en.Test1.trim}" but got "${trim}"`).toBe(testData.MLC.desktop.en.Test1.trim);
    expect(otherDetails, `Expected listing details to contain mileage "${expectedMileage}" but got "${otherDetails}"`).toContain(expectedMileage);
    expect(otherDetails, `Expected listing details to contain power "${testData.MLC.desktop.en.Test1.powerHP}" but got "${otherDetails}"`).toContain(testData.MLC.desktop.en.Test1.powerHP);
    expect(otherDetails, `Expected listing details to contain fuel type "${testData.MLC.desktop.en.Test1.fuelType}" but got "${otherDetails}"`).toContain(testData.MLC.desktop.en.Test1.fuelType);
  });

  test('should edit a Car (C) listing - Test 2', async () => {
    // Increase timeout for mobile Safari form population test
    test.setTimeout(300000); // 5 minutes
    
    // Test data for basic vehicle information

    await listingsPageActions.clickEditButton();

    const vehiclesTab = [
        { field: CAndRDropdownType.Brand, value: testData.MLC.desktop.en.Test2.make },
        { field: CAndRDropdownType.Model, value: testData.MLC.desktop.en.Test2.model },
        { field: CAndRTextInputType.MarketingTrim, value: testData.MLC.desktop.en.Test2.trim },           
    ]

    const conditionTab = [        
        { field: CAndRTextInputType.Mileage, value: testData.MLC.desktop.en.Test2.mileage },        
    ]

    const drivetrainTab = [
        { field: CAndRDropdownType.FuelType, value: testData.MLC.desktop.en.Test2.fuelType },        
        { field: CAndRTextInputType.PowerHP, value: testData.MLC.desktop.en.Test2.powerHP },        
    ]

    const priceTab = [
        { field: CAndRTextInputType.YourOfferPriceForYourVehicle, value: testData.MLC.desktop.en.Test2.offeringPrice },        
    ]    

    // Use the fillVehicleData function to fill basic vehicle data
    await mlcPageActions.fillVehicleData(vehiclesTab);    
    await mlcPageActions.fillCondition(conditionTab);    
    await mlcPageActions.fillDrivetrain(drivetrainTab);    
    await mlcPageActions.fillPrice(priceTab);
    
    await mlcPageActions.clickPublishButton();
    await pppPageActions.clickMayBeLaterLink();

    const price = await listingsPageActions.getPrice();
    const makeModel = await listingsPageActions.getMakeModel();
    const trim = await listingsPageActions.getTrim();
    const otherDetails = await listingsPageActions.getOtherDetails();
    const expectedMakeModel = testData.MLC.desktop.en.Test2.make + ' ' + testData.MLC.desktop.en.Test2.model;
    const expectedMileage = Number(testData.MLC.desktop.en.Test2.mileage).toLocaleString('en-CA');

    expect(price, `Expected listing price to be "${testData.MLC.desktop.en.Test2.offeringPrice}" but got "${price}"`).toBe(testData.MLC.desktop.en.Test2.offeringPrice);
    expect(makeModel, `Expected listing make and model to be "${expectedMakeModel}" but got "${makeModel}"`).toBe(expectedMakeModel);
    expect(trim, `Expected listing trim to be "${testData.MLC.desktop.en.Test2.trim}" but got "${trim}"`).toBe(testData.MLC.desktop.en.Test2.trim);
    expect(otherDetails, `Expected listing details to contain mileage "${expectedMileage}" but got "${otherDetails}"`).toContain(expectedMileage);
    expect(otherDetails, `Expected listing details to contain power "${testData.MLC.desktop.en.Test2.powerHP}" but got "${otherDetails}"`).toContain(testData.MLC.desktop.en.Test2.powerHP);
    expect(otherDetails, `Expected listing details to contain fuel type "${testData.MLC.desktop.en.Test2.fuelType}" but got "${otherDetails}"`).toContain(testData.MLC.desktop.en.Test2.fuelType);
  });

  test('should delete a Car (C) listing - Test 3', async () => {    
    test.setTimeout(60000);
    
    await listingsPageActions.clickDeleteButton();
    await listingsPageActions.clickConfirmDelete();    

    const actualMakeModel = await listingsPageActions.getMakeModel();
    const expectedMakeModel = testData.MLC.desktop.en.Test3.make + ' ' + testData.MLC.desktop.en.Test3.model;
    expect(actualMakeModel === null || actualMakeModel !== expectedMakeModel, `Expected listing "${expectedMakeModel}" to be deleted but it still appears on the page`).toBe(true);
  });
});

test.describe.serial('A Logged-in User ', () => {

  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'en-desktop-chrome', 'Skipped: only runs on EN Desktop Chrome');
  });

  test.beforeAll(async ({ browser }, workerInfo) => {
    const projectContext = ProjectContextManager.getInstance();
    projectContext.setContext(workerInfo.project.name as any);
    context = projectContext.getContext();
    language = projectContext.getLanguage();

    page = await browser.newPage();
    cookieHelper = new CookieHelper(page);
    await cookieHelper.addAllCommonCookies();

    mlcPageActions = OperationHandler.createActions(page, PageType.MLCPage);
    listingsPageActions = OperationHandler.createActions(page, PageType.ListingsPage);
    pppPageActions = OperationHandler.createActions(page, PageType.PPPPage);
    sharedActions = OperationHandler.createActions(page, PageType.Shared);

    await sharedActions.navigateToUrl('/');
    await sharedActions.signIn(
          getTestData(testData.credentials).username,
          getTestData(testData.credentials).password
        );
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('should create a Caravan/RV (N) listing - Test 4', async () => {
    // Increase timeout for mobile Safari form population test
    test.setTimeout(300000); // 5 minutes

    await sharedActions.navigateToUrl(testData.MLC.desktop.en.Test4.url);

    const vehiclesTab = [
        { field: CAndRDropdownType.Brand, value: testData.MLC.desktop.en.Test4.make },
        { field: CAndRTextInputType.ModelName, value: testData.MLC.desktop.en.Test4.model },
        { field: CAndRDropdownType.ModelYear, value: testData.MLC.desktop.en.Test4.year },        
    ]

    const featuresTab = [
        { field: CAndRDropdownType.BodyStyle, value: testData.MLC.desktop.en.Test4.bodyStyle },
        { field: CAndRDropdownType.NumberOfPassengers, value: testData.MLC.desktop.en.Test4.numberOfPassengers },
        { field: CAndRDropdownType.SleepingCapacity, value: testData.MLC.desktop.en.Test4.sleepingCapacity },
        { field: CAndRDropdownType.SlideOutCount, value: testData.MLC.desktop.en.Test4.slideOutCount },
        { field: CAndRColorType.ExteriorColor, value: testData.MLC.desktop.en.Test4.exteriorColor },
        { field: CAndRDropdownType.ExteriorMaterial, value: testData.MLC.desktop.en.Test4.exteriorMaterial },
        { field: CAndRDropdownType.BedType, value: testData.MLC.desktop.en.Test4.bedType },
        { field: CAndRDropdownType.RefrigeratorPowerType, value: testData.MLC.desktop.en.Test4.refrigeratorPowerType},
        { field: CAndRDropdownType.InteriorFlooringMaterial, value: testData.MLC.desktop.en.Test4.interiorFlooringMaterial },
        { field: CAndRCheckboxType.Metallic, value: true },
        { field: CAndRDropdownType.InteriorTrim, value: testData.MLC.desktop.en.Test4.interiorTrim },
        { field: CAndRColorType.InteriorColor, value: testData.MLC.desktop.en.Test4.interiorColor },
        { field: CAndRTextInputType.ChassisManufacturerName, value: testData.MLC.desktop.en.Test4.chassisManufacturerName },
        { field: CAndRTextInputType.VehicleEmptyWeight, value: testData.MLC.desktop.en.Test4.vehicleEmptyWeight },
        { field: CAndRTextInputType.FridgeCapacity, value: testData.MLC.desktop.en.Test4.fridgeCapacity },
        { field: CAndRTextInputType.WasteTankCapacity, value: testData.MLC.desktop.en.Test4.wasteTankCapacity },
        { field: CAndRTextInputType.WaterTankCapacity, value: testData.MLC.desktop.en.Test4.waterTankCapacity },
        { field: CAndRTextInputType.TotalLength, value: testData.MLC.desktop.en.Test4.totalLength },
        { field: CAndRTextInputType.TotalWidth, value: testData.MLC.desktop.en.Test4.totalWidth },
        { field: CAndRTextInputType.RVLength, value: testData.MLC.desktop.en.Test4.rvLength },
    ]

    const conditionTab = [
        { field: CAndRDropdownType.VehicleCondition, value: testData.MLC.desktop.en.Test4.vehicleCondition },
        { field: CAndRTextInputType.Mileage, value: testData.MLC.desktop.en.Test4.mileage },
        { field: CAndRDropdownType.VehicleOwners, value: testData.MLC.desktop.en.Test4.vehicleOwner },
        { field: CAndRCheckboxType.ServiceBookMaintained, value: true },        
        { field: CAndRQuestionnaireType.IsTheVehicleDamaged, value: UnknownYesNoType.Unknown },
        { field: CAndRQuestionnaireType.AccidentVehicle, value: UnknownYesNoType.No },
        { field: CAndRQuestionnaireType.Roadworthy, value: UnknownYesNoType.Yes },        
    ]

    const equipmentTab = [
        { field: CAndRCheckboxType.AutomaticClimateControl, value: true },
        { field: CAndRCheckboxType.SideAirbag, value: true },        
        { field: CAndRCheckboxType.SideAirbag, value: true },
        { field: CAndRCheckboxType.FrontCollisionWarning, value: true },
        { field: CAndRCheckboxType.RemoteKeylessEntry, value: true },
        { field: CAndRCheckboxType.AirSuspension, value: true },        
        { field: CAndRCheckboxType.SlidingDoor, value: true },
        { field: CAndRCheckboxType.RainSensingWipers, value: true },
        { field: CAndRCheckboxType.AdaptiveCruiseControl, value: true },
        { field: CAndRCheckboxType.Television, value: true },        
        { field: CAndRCheckboxType.WirelessCharging, value: true },        
        { field: CAndRCheckboxType.AlloyWheels, value: true },
        { field: CAndRCheckboxType.WC, value: true },
        { field: CAndRCheckboxType.RoofRack, value: true },
        { field: CAndRCheckboxType.NavigationSystem, value: true },        
        { field: CAndRCheckboxType.AutoLevelingHeadlights, value: true },
        { field: CAndRCheckboxType.Camera360, value: true },
        { field: CAndRCheckboxType.SplitBenchSeat, value: true },
        { field: CAndRCheckboxType.AlarmSystem, value: true },
    ]

    const drivetrainTab = [
        { field: CAndRDropdownType.FuelType, value: testData.MLC.desktop.en.Test4.fuelType },
        { field: CAndRDropdownType.DriveType, value: testData.MLC.desktop.en.Test4.driveType },
        { field: CAndRDropdownType.Transmission, value: testData.MLC.desktop.en.Test4.transmission },
        { field: CAndRTextInputType.PowerHP, value: testData.MLC.desktop.en.Test4.powerHP },        
        { field: CAndRDropdownType.Gears, value: testData.MLC.desktop.en.Test4.gears },
        { field: CAndRDropdownType.Cylinders, value: testData.MLC.desktop.en.Test4.cylinders },
        { field: CAndRTextInputType.EngineCapacity, value: testData.MLC.desktop.en.Test4.engineCapacity },
        { field: CAndRTextInputType.Wheelbase, value: testData.MLC.desktop.en.Test4.wheelbase },
        { field: CAndRTextInputType.EngineManufacturerName, value: testData.MLC.desktop.en.Test4.engineManufacturerName }
    ]

    const priceTab = [
        { field: CAndRTextInputType.YourOfferPriceForYourVehicle, value: testData.MLC.desktop.en.Test4.offeringPrice }        
    ]

    const contactTab = [
        { field: CAndRTextInputType.FirstName, value: testData.MLC.desktop.en.Test4.firstName },
        { field: CAndRTextInputType.LastName, value: testData.MLC.desktop.en.Test4.lastName },
        { field: CAndRTextInputType.PostalCode, value: testData.MLC.desktop.en.Test4.postalCode },
        { field: CAndRTextInputType.AreaCode, value: testData.MLC.desktop.en.Test4.areaCode },
        { field: CAndRTextInputType.PhoneNumber, value: testData.MLC.desktop.en.Test4.phoneNumber },
        { field: CAndRQuestionnaireType.AddAsContactOptionInTheListing, value: UnknownYesNoType.Yes }
    ]

    // Use the fillVehicleData function to fill basic vehicle data
    await mlcPageActions.fillVehicleData(vehiclesTab);
    await mlcPageActions.fillFeatures(featuresTab);
    await mlcPageActions.fillCondition(conditionTab);
    await mlcPageActions.fillEquipment(equipmentTab);
    await mlcPageActions.fillDrivetrain(drivetrainTab);
    await mlcPageActions.fillDescription(testData.MLC.desktop.en.Test4.description);
    await mlcPageActions.fillPrice(priceTab);
    await mlcPageActions.fillContact(contactTab);
    await mlcPageActions.clickPublishButton();
    await pppPageActions.clickMayBeLaterLink();

    const price = await listingsPageActions.getPrice();
    const makeModel = await listingsPageActions.getMakeModel();
    
    const otherDetails = await listingsPageActions.getOtherDetails();
    const expectedMakeModel = testData.MLC.desktop.en.Test4.make + ' ' + testData.MLC.desktop.en.Test4.model;
    const expectedMileage = Number(testData.MLC.desktop.en.Test4.mileage).toLocaleString('en-CA');

    expect(price, `Expected listing price to be "${testData.MLC.desktop.en.Test4.offeringPrice}" but got "${price}"`).toBe(testData.MLC.desktop.en.Test4.offeringPrice);
    expect(makeModel, `Expected listing make and model to be "${expectedMakeModel}" but got "${makeModel}"`).toBe(expectedMakeModel);    
    expect(otherDetails, `Expected listing details to contain mileage "${expectedMileage}" but got "${otherDetails}"`).toContain(expectedMileage);
    expect(otherDetails, `Expected listing details to contain power "${testData.MLC.desktop.en.Test4.powerHP}" but got "${otherDetails}"`).toContain(testData.MLC.desktop.en.Test4.powerHP);
    expect(otherDetails, `Expected listing details to contain fuel type "${testData.MLC.desktop.en.Test4.fuelType}" but got "${otherDetails}"`).toContain(testData.MLC.desktop.en.Test4.fuelType);
  });

  test('should edit a Caravan/RV (N) listing - Test 5', async () => {
    // Increase timeout for mobile Safari form population test
    test.setTimeout(300000); // 5 minutes
    
    // Test data for basic vehicle information

    await listingsPageActions.clickEditButton();

    const vehiclesTab = [
        { field: CAndRDropdownType.Brand, value: testData.MLC.desktop.en.Test5.make },
        { field: CAndRTextInputType.ModelName, value: testData.MLC.desktop.en.Test5.model },
    ]

    const conditionTab = [        
        { field: CAndRTextInputType.Mileage, value: testData.MLC.desktop.en.Test5.mileage },        
    ]

    const drivetrainTab = [
        { field: CAndRDropdownType.FuelType, value: testData.MLC.desktop.en.Test5.fuelType },        
        { field: CAndRTextInputType.PowerHP, value: testData.MLC.desktop.en.Test5.powerHP },        
    ]

    const priceTab = [
        { field: CAndRTextInputType.YourOfferPriceForYourVehicle, value: testData.MLC.desktop.en.Test5.offeringPrice },        
    ]    

    // Use the fillVehicleData function to fill basic vehicle data
    await mlcPageActions.fillVehicleData(vehiclesTab);    
    await mlcPageActions.fillCondition(conditionTab);    
    await mlcPageActions.fillDrivetrain(drivetrainTab);    
    await mlcPageActions.fillPrice(priceTab);
    
    await mlcPageActions.clickPublishButton();
    await pppPageActions.clickMayBeLaterLink();

    const price = await listingsPageActions.getPrice();
    const makeModel = await listingsPageActions.getMakeModel();    
    const otherDetails = await listingsPageActions.getOtherDetails();
    const expectedMakeModel = testData.MLC.desktop.en.Test5.make + ' ' + testData.MLC.desktop.en.Test5.model;
    const expectedMileage = Number(testData.MLC.desktop.en.Test5.mileage).toLocaleString('en-CA');

    expect(price, `Expected listing price to be "${testData.MLC.desktop.en.Test5.offeringPrice}" but got "${price}"`).toBe(testData.MLC.desktop.en.Test5.offeringPrice);
    expect(makeModel, `Expected listing make and model to be "${expectedMakeModel}" but got "${makeModel}"`).toBe(expectedMakeModel);    
    expect(otherDetails, `Expected listing details to contain mileage "${expectedMileage}" but got "${otherDetails}"`).toContain(expectedMileage);
    expect(otherDetails, `Expected listing details to contain power "${testData.MLC.desktop.en.Test5.powerHP}" but got "${otherDetails}"`).toContain(testData.MLC.desktop.en.Test5.powerHP);
    expect(otherDetails, `Expected listing details to contain fuel type "${testData.MLC.desktop.en.Test5.fuelType}" but got "${otherDetails}"`).toContain(testData.MLC.desktop.en.Test5.fuelType);    
  });

  test('should delete a Caravan/RV (N) listing - Test 6', async () => {    
    test.setTimeout(60000);
    
    await listingsPageActions.clickDeleteButton();
    await listingsPageActions.clickConfirmDelete();    

    const actualMakeModel = await listingsPageActions.getMakeModel();
    const expectedMakeModel = testData.MLC.desktop.en.Test6.make + ' ' + testData.MLC.desktop.en.Test6.model;
    expect(actualMakeModel === null || actualMakeModel !== expectedMakeModel, `Expected listing "${expectedMakeModel}" to be deleted but it still appears on the page`).toBe(true);    
  });
});

test.describe.serial('A Logged-in User ', () => {

  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'en-desktop-chrome', 'Skipped: only runs on EN Desktop Chrome');
  });

  test.beforeAll(async ({ browser }, workerInfo) => {
    const projectContext = ProjectContextManager.getInstance();
    projectContext.setContext(workerInfo.project.name as any);
    context = projectContext.getContext();
    language = projectContext.getLanguage();

    page = await browser.newPage();
    cookieHelper = new CookieHelper(page);
    await cookieHelper.addAllCommonCookies();

    mlcPageActions = OperationHandler.createActions(page, PageType.MLCPage);
    listingsPageActions = OperationHandler.createActions(page, PageType.ListingsPage);
    pppPageActions = OperationHandler.createActions(page, PageType.PPPPage);
    sharedActions = OperationHandler.createActions(page, PageType.Shared);

    await sharedActions.navigateToUrl('/');
    await sharedActions.signIn(
          getTestData(testData.credentials).username,
          getTestData(testData.credentials).password
        );
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('should create a Commercial/Heavy Trucks (X) listing - Test 7', async () => {
    // Increase timeout for mobile Safari form population test
    test.setTimeout(300000); // 5 minutes

    await sharedActions.navigateToUrl(testData.MLC.desktop.en.Test7.url);

    const vehiclesTab = [
        { field: CAndRDropdownType.Brand, value: testData.MLC.desktop.en.Test7.make },
        { field: CAndRTextInputType.ModelName, value: testData.MLC.desktop.en.Test7.model },
        { field: CAndRDropdownType.ModelYear, value: testData.MLC.desktop.en.Test7.year },        
    ]

    const featuresTab = [
        { field: CAndRDropdownType.BodyStyle, value: testData.MLC.desktop.en.Test7.bodyStyle },
        { field: CAndRDropdownType.NumberOfPassengers, value: testData.MLC.desktop.en.Test7.numberOfPassengers },
        { field: CAndRDropdownType.NumberOfDoors, value: testData.MLC.desktop.en.Test7.numberOfDoors },
        { field: CAndRColorType.ExteriorColor, value: testData.MLC.desktop.en.Test7.exteriorColor },
        { field: CAndRCheckboxType.Metallic, value: true },
        { field: CAndRDropdownType.InteriorTrim, value: testData.MLC.desktop.en.Test7.interiorTrim },
        { field: CAndRColorType.InteriorColor, value: testData.MLC.desktop.en.Test7.interiorColor },
        { field: CAndRTextInputType.VehicleEmptyWeight, value: testData.MLC.desktop.en.Test7.vehicleEmptyWeight },        
    ]

    const conditionTab = [
        { field: CAndRDropdownType.VehicleCondition, value: testData.MLC.desktop.en.Test7.vehicleCondition },
        { field: CAndRTextInputType.Mileage, value: testData.MLC.desktop.en.Test7.mileage },
        { field: CAndRTextInputType.EngineOperatingHours, value: testData.MLC.desktop.en.Test7.engineOperatingHours },
        { field: CAndRDropdownType.VehicleOwners, value: testData.MLC.desktop.en.Test7.vehicleOwners },
        { field: CAndRCheckboxType.ServiceBookMaintained, value: true },
        { field: CAndRQuestionnaireType.IsTheVehicleDamaged, value: UnknownYesNoType.Yes },
        { field: CAndRQuestionnaireType.AccidentVehicle, value: UnknownYesNoType.No },
        { field: CAndRQuestionnaireType.Roadworthy, value: UnknownYesNoType.Unknown },
        { field: CAndRQuestionnaireType.IsCabinClean, value: UnknownYesNoType.Yes },
    ]

    const equipmentTab = [
        { field: CAndRCheckboxType.AutomaticClimateControlDualZone, value: true },
        { field: CAndRCheckboxType.DriverSideAirbag, value: true },        
        { field: CAndRCheckboxType.BlindSpotMonitor, value: true },
        { field: CAndRCheckboxType.PowerDoorLocks, value: true },
        { field: CAndRCheckboxType.AirSuspension, value: true },
        { field: CAndRCheckboxType.VoiceControl, value: true },        
        { field: CAndRCheckboxType.TrailerHitch, value: true },
        { field: CAndRCheckboxType.AmFmStereo, value: true },
        { field: CAndRCheckboxType.FogLights, value: true },
        { field: CAndRCheckboxType.Camera360, value: true },        
        { field: CAndRCheckboxType.PowerSeats, value: true },        
        { field: CAndRCheckboxType.AlarmSystem, value: true },
    ]

    const drivetrainTab = [
        { field: CAndRDropdownType.FuelType, value: testData.MLC.desktop.en.Test7.fuelType },
        { field: CAndRDropdownType.DriveType, value: testData.MLC.desktop.en.Test7.driveType },
        { field: CAndRDropdownType.Transmission, value: testData.MLC.desktop.en.Test7.transmission },
        { field: CAndRTextInputType.PowerHP, value: testData.MLC.desktop.en.Test7.powerHP },        
        { field: CAndRDropdownType.Gears, value: testData.MLC.desktop.en.Test7.gears },
        { field: CAndRDropdownType.Cylinders, value: testData.MLC.desktop.en.Test7.cylinders },
        { field: CAndRTextInputType.EngineCapacity, value: testData.MLC.desktop.en.Test7.engineCapacity },
        { field: CAndRTextInputType.Wheelbase, value: testData.MLC.desktop.en.Test7.wheelbase },
        { field: CAndRTextInputType.AxleSpread, value: testData.MLC.desktop.en.Test7.axleSpread },
        { field: CAndRTextInputType.CabToAxle, value: testData.MLC.desktop.en.Test7.cabToAxle },
        { field: CAndRTextInputType.FrameType, value: testData.MLC.desktop.en.Test7.frameType },
        { field: CAndRTextInputType.EngineControlModule, value: testData.MLC.desktop.en.Test7.engineControlModule },
        { field: CAndRTextInputType.EngineMarketingDescription, value: testData.MLC.desktop.en.Test7.engineMarketingDescription },
        { field: CAndRTextInputType.FrontAxleCapacity, value: testData.MLC.desktop.en.Test7.frontAxleCapacity },
        { field: CAndRTextInputType.RearAxleCapacity, value: testData.MLC.desktop.en.Test7.rearAxleCapacity },
        { field: CAndRTextInputType.DifferentialRatio, value: testData.MLC.desktop.en.Test7.differentialRatio },
        { field: CAndRDropdownType.BrakeType, value: testData.MLC.desktop.en.Test7.brakeType }
    ]

    const priceTab = [
        { field: CAndRTextInputType.YourOfferPriceForYourVehicle, value: testData.MLC.desktop.en.Test7.offeringPrice }        
    ]

    const contactTab = [
        { field: CAndRTextInputType.FirstName, value: testData.MLC.desktop.en.Test7.firstName },
        { field: CAndRTextInputType.LastName, value: testData.MLC.desktop.en.Test7.lastName },
        { field: CAndRTextInputType.PostalCode, value: testData.MLC.desktop.en.Test7.postalCode },
        { field: CAndRTextInputType.AreaCode, value: testData.MLC.desktop.en.Test7.areaCode },
        { field: CAndRTextInputType.PhoneNumber, value: testData.MLC.desktop.en.Test7.phoneNumber },
        { field: CAndRQuestionnaireType.AddAsContactOptionInTheListing, value: UnknownYesNoType.No }
    ]

    // Use the fillVehicleData function to fill basic vehicle data
    await mlcPageActions.fillVehicleData(vehiclesTab);
    await mlcPageActions.fillFeatures(featuresTab);
    await mlcPageActions.fillCondition(conditionTab);
    await mlcPageActions.fillEquipment(equipmentTab);
    await mlcPageActions.fillDrivetrain(drivetrainTab);
    await mlcPageActions.fillDescription(testData.MLC.desktop.en.Test7.description);
    await mlcPageActions.fillPrice(priceTab);
    await mlcPageActions.fillContact(contactTab);
    await mlcPageActions.clickPublishButton();
    await pppPageActions.clickMayBeLaterLink();

    const price = await listingsPageActions.getPrice();
    const makeModel = await listingsPageActions.getMakeModel();
    
    const otherDetails = await listingsPageActions.getOtherDetails();
    const expectedMakeModel = testData.MLC.desktop.en.Test7.make + ' ' + testData.MLC.desktop.en.Test7.model;
    const expectedMileage = Number(testData.MLC.desktop.en.Test7.mileage).toLocaleString('en-CA');
    const expectedPowerHP = Number(testData.MLC.desktop.en.Test7.powerHP).toLocaleString('en-CA');

    expect(price, `Expected listing price to be "${testData.MLC.desktop.en.Test7.offeringPrice}" but got "${price}"`).toBe(testData.MLC.desktop.en.Test7.offeringPrice);
    expect(makeModel, `Expected listing make and model to be "${expectedMakeModel}" but got "${makeModel}"`).toBe(expectedMakeModel);
    expect(otherDetails, `Expected listing details to contain mileage "${expectedMileage}" but got "${otherDetails}"`).toContain(expectedMileage);
    expect(otherDetails, `Expected listing details to contain power "${expectedPowerHP}" but got "${otherDetails}"`).toContain(expectedPowerHP);
    expect(otherDetails, `Expected listing details to contain fuel type "${testData.MLC.desktop.en.Test7.fuelType}" but got "${otherDetails}"`).toContain(testData.MLC.desktop.en.Test7.fuelType);
  });

  test('should edit a Commercial/Heavy Trucks (X) listing - Test 8', async () => {
    // Increase timeout for mobile Safari form population test
    test.setTimeout(300000); // 5 minutes
    
    // Test data for basic vehicle information

    await listingsPageActions.clickEditButton();

    const vehiclesTab = [
        { field: CAndRDropdownType.Brand, value: testData.MLC.desktop.en.Test8.make },
        { field: CAndRTextInputType.ModelName, value: testData.MLC.desktop.en.Test8.model },
    ]

    const conditionTab = [        
        { field: CAndRTextInputType.Mileage, value: testData.MLC.desktop.en.Test8.mileage },        
    ]

    const drivetrainTab = [
        { field: CAndRDropdownType.FuelType, value: testData.MLC.desktop.en.Test8.fuelType },        
        { field: CAndRTextInputType.PowerHP, value: testData.MLC.desktop.en.Test8.powerHP },        
    ]

    const priceTab = [
        { field: CAndRTextInputType.YourOfferPriceForYourVehicle, value: testData.MLC.desktop.en.Test8.offeringPrice },        
    ]    

    // Use the fillVehicleData function to fill basic vehicle data
    await mlcPageActions.fillVehicleData(vehiclesTab);    
    await mlcPageActions.fillCondition(conditionTab);    
    await mlcPageActions.fillDrivetrain(drivetrainTab);    
    await mlcPageActions.fillPrice(priceTab);
    
    await mlcPageActions.clickPublishButton();
    await pppPageActions.clickMayBeLaterLink();

    const price = await listingsPageActions.getPrice();
    const makeModel = await listingsPageActions.getMakeModel();    
    const otherDetails = await listingsPageActions.getOtherDetails();
    const expectedMakeModel = testData.MLC.desktop.en.Test8.make + ' ' + testData.MLC.desktop.en.Test8.model;
    const expectedMileage = Number(testData.MLC.desktop.en.Test8.mileage).toLocaleString('en-CA');
    const expectedPowerHP = Number(testData.MLC.desktop.en.Test8.powerHP).toLocaleString('en-CA');

    expect(price, `Expected listing price to be "${testData.MLC.desktop.en.Test8.offeringPrice}" but got "${price}"`).toBe(testData.MLC.desktop.en.Test8.offeringPrice);
    expect(makeModel, `Expected listing make and model to be "${expectedMakeModel}" but got "${makeModel}"`).toBe(expectedMakeModel);
    expect(otherDetails, `Expected listing details to contain mileage "${expectedMileage}" but got "${otherDetails}"`).toContain(expectedMileage);
    expect(otherDetails, `Expected listing details to contain power "${expectedPowerHP}" but got "${otherDetails}"`).toContain(expectedPowerHP);
    expect(otherDetails, `Expected listing details to contain fuel type "${testData.MLC.desktop.en.Test8.fuelType}" but got "${otherDetails}"`).toContain(testData.MLC.desktop.en.Test8.fuelType);    
  });

  test('should delete a Commercial/Heavy Trucks (X) listing - Test 9', async () => {    
    test.setTimeout(60000);
    
    await listingsPageActions.clickDeleteButton();
    await listingsPageActions.clickConfirmDelete();    

    const actualMakeModel = await listingsPageActions.getMakeModel();
    const expectedMakeModel = testData.MLC.desktop.en.Test9.make + ' ' + testData.MLC.desktop.en.Test9.model;
    expect(actualMakeModel === null || actualMakeModel !== expectedMakeModel, `Expected listing "${expectedMakeModel}" to be deleted but it still appears on the page`).toBe(true);    
  });
});

















