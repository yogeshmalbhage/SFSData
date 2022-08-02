@isTest
global class SFSDataDisplayControllerMock implements HttpCalloutMock{

    global HTTPResponse respond(HTTPRequest request) {
        HttpResponse response = new HttpResponse();
        response.setHeader('Content-Type', 'application/json');
        response.setBody('{"SFSData": {"id":2, "creditorName":"Test", "firstName":"TestF", "lastName":"Test", "minPaymentPercentage":"0.02", "balance":"220"}}');
        response.setStatusCode(200);
        return response; 
    }
} 