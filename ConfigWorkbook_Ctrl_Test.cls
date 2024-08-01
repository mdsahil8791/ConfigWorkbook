/*
Created By          : Girikon (Mohd Sahil)
Created On          : July 18, 2024
@description        : This class is covered ConfigWorkbook_Ctrl.

Modification log --
Modified By         : 
Modified On         : 

*/
@isTest
public with sharing class ConfigWorkbook_Ctrl_Test {

    // Call the getAllObject method.
    @isTest
    public static void testGetAllObjects() {
        Test.startTest();
        Map<String,String> labelVSApiName = ConfigWorkbook_Ctrl.getAllObjects();
        System.assertEquals(true, labelVSApiName.containsKey('Account'), 'Account should be in the map');
        Test.stopTest();
    }

    // Call the getAllObject method.
    @isTest
    public static void testGetObjectFields() {
        Test.startTest();
        Map<String, List<ConfigWorkbook_Ctrl.FieldInfo>> objectFieldsMap = ConfigWorkbook_Ctrl.getObjectFields(new List<String>{'Account','Contact'});
        System.assertEquals(true, objectFieldsMap.containsKey('Account'), 'Account should be in the map as a Key');
        Test.stopTest();
    }
   
}