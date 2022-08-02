public with sharing class SFSDataDisplayController {
    
    @AuraEnabled(cacheable = true)
    public static String fetchSFSData() {

        HttpRequest req = new HttpRequest(); 
        HttpResponse res = new HttpResponse();            
        Http h = new Http();

        try{  

            //Prepare and send request to fetch Recruitment Data
            req.setMethod('GET');
            req.setEndpoint('https://raw.githubusercontent.com/StrategicFS/Recruitment/master/data.json');
            res = h.send(req);
        }catch(Exception ex){
            throw new AuraHandledException(ex.getMessage());
        }
        
        //Return response body
        return res.getBody();
    }
}