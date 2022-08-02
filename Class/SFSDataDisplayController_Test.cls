@isTest
global class SFSDataDisplayController_Test {

    static testMethod void testPostCallout() {
        Test.setMock(HttpCalloutMock.class, new SFSDataDisplayControllerMock());  
        String strResp = SFSDataDisplayController.fetchSFSData();
    }
} 