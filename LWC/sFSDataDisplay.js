import { LightningElement, wire, track, api } from 'lwc';
import getSFSData from '@salesforce/apex/SFSDataDisplayController.fetchSFSData';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class SFSDataDisplay extends LightningElement {
    @track isEmpty = true;
    @track sfsData;
    @track totalBalance = 0.00;
    @track totalRowsCount = 0;
    @track checkedRowsCount = 0;
    @track removedRowsCount = 0;
    @track selectedRows;
    @track isShowModal = false;
    @track creditor;
    @track firstName;
    @track lastName;
    @track minPayPer;
    @track balance; 

    totalBalance = this.totalBalance.toFixed(2);

    @track columns = [
        { 
            label: 'Creditor', 
            fieldName: 'creditorName', 
            type: 'text',
            cellAttributes:{
                class:{
                    fieldName:'cellcolor'
                }
            }
        },

        { 
            label: 'First Name', 
            fieldName: 'firstName', 
            type: 'text',
            cellAttributes:{
                class:{
                    fieldName:'cellcolor'
                }
            }
        },

        { 
            label: 'Last Name', 
            fieldName: 'lastName',
            type: 'text',
            cellAttributes:{
                class:{
                    fieldName:'cellcolor'
                }
            }
        },

        { 
            label: 'Min Pay%', 
            fieldName: 'minPaymentPercentage', 
            type: 'percent',
            typeAttributes: {
                step: '0.01',
                minimumFractionDigits: '2',
                maximumFractionDigits: '2',
            },
            cellAttributes:{
                class:{
                    fieldName:'cellcolor'
                }
            }
        },

        { 
            label: 'Balance', 
            fieldName: 'balance', 
            type: 'currency',
            typeAttributes: {
                step: '0.01',
                minimumFractionDigits: '2',
                maximumFractionDigits: '2',
            },
            cellAttributes:{
                class:{
                    fieldName:'cellcolor'
                }
            }
        }
    ];

    //Fetch data through apex
    @wire(getSFSData)
    wiredSFSData({data, error}){
        if(data){
            this.sfsData = JSON.parse(data);
            this.totalRowsCount = this.sfsData.length;
            if(this.sfsData != undefined && this.sfsData.length > 0){
                this.isEmpty = false;
                for(let i = 0; i < this.sfsData.length; i++){
                    this.sfsData[i].minPaymentPercentage = this.sfsData[i].minPaymentPercentage / 100.00;
                }
            }else{
                this.isEmpty = true;
            }
            
        }else if(error){
            //Display Error message
            const evt = new ShowToastEvent({
                title: "Something went wrong",
                message: error.body.message,
                variant: "error",
            });
            this.dispatchEvent(evt);
        }
    }

    //Calculate total balance
    calculateBalance(event){
        const selectedRows = event.detail.selectedRows;
        this.totalBalance = 0.00;
        this.checkedRowsCount = 0;
        for (let i = 0; i < selectedRows.length; i++) {
            if(selectedRows[i].balance != undefined && selectedRows[i].balance != 0){
                this.totalBalance += selectedRows[i].balance;
            }
            
            this.checkedRowsCount += 1;
        }

        //Add 2 decimal places
        this.totalBalance = this.totalBalance.toFixed(2);
        this.selectedRows = selectedRows;
    }

    //Handle Add Debt
    handleAddDebt(event){
        this.isShowModal = true;
    }

    handleCreditorChange(event){
        this.creditor = event.detail.value;
    }

    handleFirstNameChange(event){
        this.firstName = event.detail.value;
    }

    handleLastNameChange(event){
        this.lastName = event.detail.value;
    }

    handleMinPayPerChange(event){
        this.minPayPer = parseFloat(event.detail.value);
    }

    handleBalanceChange(event){
        this.balance = parseFloat(event.detail.value);
    }

    //Handle Save Record
    handleSave(event){
        var sfsDataCopy = this.sfsData;
        var objId;

        //Set record id 
        if(sfsDataCopy != undefined && sfsDataCopy.length > 0){
            objId = parseInt(sfsDataCopy[sfsDataCopy.length - 1].id) + 1;
        }

        //Push new row to list
        sfsDataCopy.push({id : objId, creditorName : this.creditor, firstName : this.firstName, lastName : this.lastName, minPaymentPercentage : this.minPayPer * 0.01, balance : this.balance, "cellcolor" : "slds-color__background_gray-7"});
        this.isShowModal = false;
        this.sfsData = [...sfsDataCopy];
        this.totalRowsCount++;
        this.isEmpty = false;

        this.creditor = "";
        this.firstName = "";
        this.lastName = "";
        this.minPayPer = "";
        this.balance = "";
        
        //Display success message
        const evt = new ShowToastEvent({
            title: "Success",
            message: "Debt added successfully",
            variant: "success",
        });
        this.dispatchEvent(evt);
    }

    showModalBox() {  
        this.isShowModal = true;
    }

    hideModalBox() {  
        this.isShowModal = false;
    }

    //Remove selected rows
    handleRemoveDebt(event){
        var selectedRowIds = [];
        var sfsDataCopy = this.sfsData;

        if(this.selectedRows != undefined && this.selectedRows != null && this.selectedRows.length > 0){
            for(let i = this.selectedRows.length - 1; i >= 0; i--){
                selectedRowIds.push(this.selectedRows[i].id);
            }
            
            //Remove rows from list
            for(let i = sfsDataCopy.length - 1 + this.removedRowsCount; i >= 0; i--){
                if(sfsDataCopy != undefined && sfsDataCopy[i] != undefined && selectedRowIds.includes(sfsDataCopy[i].id)){
                    
                    sfsDataCopy.splice(i, 1);
                    this.removedRowsCount++;
                    this.totalRowsCount--;
                }
            }
            
            //Refresh the list
            this.sfsData = [...sfsDataCopy];
            this.selectedRows = [];

            if(this.sfsData === undefined || this.sfsData.length === 0){
                this.isEmpty = true;
            }
            //Show success message
            const evt = new ShowToastEvent({
                title: "Success",
                message: "Debt removed successfully",
                variant: "success",
            });
            this.dispatchEvent(evt);
        }
        
    }
}
