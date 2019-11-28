//BUDGET CONTROLLER
let budgetController=(function(){
    //DECLARING THE OBJECTS
    let Expense=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage=-1;
    }
    let Income=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    }
    //ADD A FUNCTION TO CALCULATE THE PERCENTAGE IN THE EXPENCE PROTOTYPE
    Expense.prototype.calcPercentage=function(income){
        if(income>0){
            this.percentage=Math.round((this.value*100)/income);
        }else{
            this.percentage=-1;
        }
        
    }
    //DATA SCTRUCTURE FOR THE APP
    let data={
        allItems:{
            exp:[],
            inc:[]
        },
        totals:{
            exp:0,
            inc:0,
        },
        budget:0,
        percentage:-1
    };
    //CALCULATE THE TOTAL INCOME AND EXPENSE
    let calculateTotal=function(type){
        data.totals[type]= data.allItems[type].reduce((total,curr,index)=>total+=curr.value,0);
    }
    
    return {
        addItem:function(type,description,value){
            let id,newItem;
            
            //CREATE THE ID
            if(data.allItems[type].length>0){
                id=(data.allItems[type][data.allItems[type].length-1].id)+1;
            }else{
                id=0;
            }

            //CREATE THE OBJECT DEPENDIN ON THE TYPE AND STRORE IT 
            if(type==="exp"){
                newItem=new Expense(id,description,value);
                data.allItems[type].push(newItem);
            }else if(type==='inc'){
                newItem=new Income(id,description,value);
                data.allItems[type].push(newItem);
            }
            
            //RETURN THE OBJECT FOR DISPLAY
            return newItem;
            
            
        },
        testing:function(){
            return data;
        },
        calculateBudget:function(){
            //calculate total income
            calculateTotal("inc");
            //CALCULATE TOTAL EXPENSES
            calculateTotal('exp');
            //CALCULATE THE BUDGET
            data.budget=data.totals.inc-data.totals.exp;
            //percentage
            if(data.totals.inc>0){
                data.percentage=Math.round((data.totals.exp*100)/data.totals.inc);
            }else{
                data.percentage=-1
            }
            
            return{
                exp:data.totals.exp,
                inc:data.totals.inc,
                budget:data.budget,
                percentage:data.percentage
            }
        },
        deleteItem:function(type,id){
            let ids,index;
            //CRERE UN TABLEAU QUI CONTIENT TOUT LES ID DU TYPE VOLUE
            ids = data.allItems[type].map(curr=>curr.id);
            index=ids.indexOf(parseInt(id));
            data.allItems[type].splice(index,1);
        },
        calculatePercentage:function(){
             data.allItems['exp'].forEach(curr=>curr.calcPercentage(data.totals.inc));
        },
        getPercentage:function(){
            let percentage;
            percentage=data.allItems['exp'].map(curr=>curr.percentage);
            return percentage;
        }
    }

})();
//UICONTROLLER
let UIController=(function(){
    let DOMStrings={
        domBtn:".add__btn",
        domType:".add__type",
        domDescription:".add__description",
        domValue:".add__value",
        expenseContainer:".expenses__list",
        incomeContainer:".income__list",
        budget:'.budget__value',
        budgetIncome:'.budget__income--value',
        budgetExpense:".budget__expenses--value",
        budgetMonth:".budget__title--month",
        budgetPercentage:'.budget__expenses--percentage',
        container:".container",
        expensePercentage:".item__percentage"
    };
    var nodeParser=function(list,calback){
        for(let i=0;i<list.length;i++){
            calback(list[i],i);
        }
    }
    var formatNumber=function(number,type){
        let decimal,int;
        number=Math.abs(number);
        number=number.toFixed(2);
        number=number.split('.');
        decimal=number[1];
        int=number[0];
        if(int>999){
            int=int.substring(0,(int.length)-3)+','+int.substring(int.length-3);
        }
        
        return  type==='exp'?'- '+int+'.'+decimal:'+ '+int+'.'+decimal;
    };
    var formatBudget=function(budget){
        let number;
        number=budget;
        number=Math.abs(number);
        number=number.toFixed(2);
        number=number.split('.');
        decimal=number[1];
        int=number[0];
        if(int>999){
            int=int.substring(0,(int.length)-3)+','+int.substring(int.length-3);
        }
        return budget<=0?'- '+int+'.'+decimal:'+ '+int+'.'+decimal;
    }
    return{
        getDOMStrings:function(){
            return DOMStrings;
        },
        getInput:function(){

            return{
                inputType:document.querySelector(DOMStrings.domType).value,
                inputDescription:document.querySelector(DOMStrings.domDescription).value,
                inputValue:parseInt(document.querySelector(DOMStrings.domValue).value)
            }
        },
        addListItem:function(type,obj){
            let html,newHtml;
            //PREPARE THE HTML ELMENENT
            if(type==="exp"){
                html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type==="inc"){
                html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            //CHANGE THE PLACE HOLDER
            newHtml=html.replace("%id%",obj.id);
            newHtml=newHtml.replace("%description%",obj.description);
            newHtml=newHtml.replace("%value%",formatNumber(obj.value,type));
            //INSERT THE HTML ELEMENT WITH INSERTADJACENTHTML
            if(type==="inc"){
                document.querySelector(DOMStrings.incomeContainer).insertAdjacentHTML("beforeend",newHtml);
            }else if(type==="exp"){
                document.querySelector(DOMStrings.expenseContainer).insertAdjacentHTML("beforeend",newHtml);
            }
            
        },
        clearFields:function(){
            let items;
            //get the fields we want to clear
            items=document.querySelectorAll(DOMStrings.domDescription+","+DOMStrings.domValue);
            nodeParser(items,function(curr,index){
                if(index===0){
                    curr.value="";
                    curr.focus();
                }else{
                    curr.value="";
                }
                
            });

        },
        displayBudget:function(obj){
            //DISPLAY THE BUDGET
            document.querySelector(DOMStrings.budget).textContent=formatBudget(obj.budget);
            //DISPLAY INCOME
            document.querySelector(DOMStrings.budgetIncome).textContent=formatNumber(obj.inc,'inc');
            //DISPLAY EXPENCE
            document.querySelector(DOMStrings.budgetExpense).textContent=formatNumber(obj.exp,'exp');
            //DISPLAY PERCENTAAGE
            if(obj.percentage>0){
                document.querySelector(DOMStrings.budgetPercentage).textContent=obj.percentage+'%';
            }else{
                document.querySelector(DOMStrings.budgetPercentage).textContent='---';
            }
            
        },
        displayPercentage:function(percentages){
            //GET THE HTML CONTAINER WITH QUERYSELECTORALL
            let expenses=document.querySelectorAll(DOMStrings.expensePercentage);
            //GO THROW THIS ELEMENT USING THE NODEPARSE AND CHANGE EVERY ELEMENT 
            nodeParser(expenses,function(curr,index){
                if(percentages[index]>0){
                    curr.textContent=percentages[index]+"%";
                }else{
                    curr.textContent="---";
                }
            });
        },
        displayMonth:function(){
            let now = new Date();
            let months=["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            document.querySelector(DOMStrings.budgetMonth).textContent=months[now.getMonth()]+" "+now.getFullYear();
        }
        
    }
})();
//CONTROLLER 
let controller=(function(budgetCtrl,UICtrl){
    var nodeParser=function(list,calback){
        for(let i=0;i<list.length;i++){
            calback(list[i],i);
        }
    }
    //UPDATE THE BUDGET
    let updateBudget=function(){
        let totals;
        //CALCULATE THE BUDGET
        totals=budgetCtrl.calculateBudget();
        console.log(totals)
        //DISPLAY BUDGET
        UICtrl.displayBudget(totals);
    }
    // UPDATE PERCENTAGE
    let updatePercentage=function(){
        let percentages;
        //CALCULATE PERCENTAGE
        budgetCtrl.calculatePercentage();
        //GET PERCENTAGES
        percentages=budgetCtrl.getPercentage();
        //DISPLAY PERCENTAGE
        UICtrl.displayPercentage(percentages);
    }
    //CONTROLLER FOR ADDING ITEM
    let ctrlAddItem=function(){
        let inputs,newItem;
        //GET INPUT
        inputs=UICtrl.getInput();
        if(inputs.inputDescription!=0 && !isNaN(inputs.inputValue) && inputs.inputValue>0){
            //ADD ITEM TO THE data structure
            newItem=budgetCtrl.addItem(inputs.inputType,inputs.inputDescription,inputs.inputValue);
            //ADD THE ELEMENT INTHE UI
            UICtrl.addListItem(inputs.inputType,newItem);
            //CLEAT THE FIELDS
            UICtrl.clearFields();
            //UPDATE THE BUDGET
            updateBudget();
            //UPDATE PERCENTAGE
            updatePercentage();
        }
    }
    //CONTROLLER FOR DELETING ITEM
    let ctrlDeleteItem=function(event){
        let item,type,id;
        //take the id of the element
        item=event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(item){
            items=item.split('-');
            type=items[0];
            id=items[1];
            //DELELTE ITEEM FROM DATA STRUCTURE
            budgetCtrl.deleteItem(type,id);
            //DELETE THE ELEMENT BY SELECTING HIS PARENT THE REMOVE IT
            
            let element=document.getElementById(item);
            console.log(element)
            element.parentNode.removeChild(element);
            //UPDATE THE UI
            updateBudget();
            //UPDATE PERCENTAGE
            updatePercentage();
        }
        
    }
    //EVENT HANDLER 
    let setupEventHandler=function(){
        let dom=UIController.getDOMStrings();
        //HANDLING THE ENTER KEY PRESS
        document.addEventListener("keypress",function(e){
            let code=e.keyCode?e.keyCode:e.which;
            if(code===13){
                ctrlAddItem();
            }
        });
        //HANDLING THE BUTTON PRESS
        document.querySelector(dom.domBtn).addEventListener("click",ctrlAddItem);
        //HANDLING THE DELETE BUTTON
        document.querySelector(dom.container).addEventListener("click",ctrlDeleteItem);
        //CHANGING STATE OF THE SELECT
        document.querySelector(dom.domType).addEventListener("change",function(event){
            let items=document.querySelectorAll(dom.domType+","+dom.domDescription+","+dom.domValue);
            nodeParser(items,function(curr,index){
                curr.classList.toggle("red-focus");
            });
            document.querySelector(dom.domBtn).classList.toggle("red");
        });
    }
    return{
        init:function(){
            console.log("App just Started");
            let data={
                exp:0,
                inc:0,
                budget:0,
                percentage:-1
            }
            UICtrl.displayBudget(data);
            UICtrl.displayMonth();
            setupEventHandler();
        }
    }
})(budgetController,UIController);
controller.init();