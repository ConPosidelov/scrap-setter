//
'use strict';

(function backgroundFunction ()  {

   // создаем базу 
    const DBNAME     = 'ScrupSetter',
          PAGESTORE  = 'PAGESTORE';

    setDbStorages(DBNAME, PAGESTORE);       


   chrome.extension.onMessage.addListener(function(req, sender, sendResp){
   
    if(req.key=="getResList") {

       let resList = req.res;
        

       getCurrentTabUrl((url)=> {
        console.log('Url2 = ', url );

        let sequence = Promise.resolve();
        resList.forEach((el)=>{
         el.url = url;
         sequence = sequence.then(()=>{
            return saveToDb(el, DBNAME, PAGESTORE);
         });
            
        });
        //saveArrToDb(resList, DBNAME, PAGESTORE);
        console.log('resList = ', resList );

        
        

       });

        
    }


   });  

  
  // Функция получает урл открытого таба
  // возвращает его в колбэке в качестве аргумента

  function getCurrentTabUrl(callback) {  
      let queryInfo = {
        active: true, 
        currentWindow: true
      };

      chrome.tabs.query(queryInfo, (tabs) =>{
        let tab = tabs[0]; 
        let url = tab.url;
        callback(url);
      });
  } 




  // Функция создает базу данных
  //
  //

  function setDbStorages(DBNAME, PAGESTORE) {

    let request = indexedDB.open(DBNAME);
    request.onerror = function(event){
        console.log(' Какая то ошибка !!! ' + event.target.errorCode);
        //Сюда надо написать обработчик ошибки
    };
    request.onsuccess = function(event) {
        let db = request.result; 
        console.log(  'версия БД =    ',  db.version);
        db.close();
    };
    // создание хранилища
    request.onupgradeneeded = function(){
        console.log('onupgradeneeded  сработал');
        let db = request.result;
        let store1 = db.createObjectStore(PAGESTORE, {
            keyPath: "id",
        });
        store1.createIndex("by_id", "id");
        store1.createIndex("by_project", "project");
        store1.createIndex("by_url", "url");

        console.log('Создано   ', PAGESTORE );
       
    };
  }
    /*-----------------------------------------
    PAGESTORE 
     {
`     id : Number  
      project: NAME,
      url: URL,
      name: NAME,
      sel: SELECTOR
      content: text/img/html
      ref: href
     }

    */
    //-----------------------------------------

  // Функция сохраняет эл в базу данных
  //
  //

function saveToDb(el, dbName, storeName) {
    
    return new Promise(function(resolve, reject) {
    
        if(!dbName) reject('Нет базы');
        if(!storeName) reject('Нет хранилища');
        if(!el.project) reject('Нет project');
        if(!el.url) reject('Нет url');
        if(!el.name) reject('Нет name');
        el.id = ''+ Date.now();

        let request = indexedDB.open(dbName);
        request.onerror = (event) => reject('Ошибка открытия базы '+ event.target.errorCode);
        request.onsuccess = () => {
            let db = request.result;
            let tx = db.transaction(storeName, "readwrite");
            let store = tx.objectStore(storeName);
            let request2 = store.put(el);

            tx.oncomplete = () => {
                db.close();
                console.log('saveToDb6');
                resolve('Все запросы выполнены успешно');
            }; 
            tx.onabort = () => reject('Ошибка транзакции '+ tx.error.message);
        };
 
    });


}  

// Функция сохраняет коллекцию  в базу данных
//
//  НЕ ГОДИТЬСЯ - ТЕРЯЮТСЯ ЭЛЕМЕНТЫ

function saveArrToDb(arr, dbName, storeName) {
    
    return new Promise(function(resolve, reject) {
    
        if(!dbName) reject('Нет базы');
        if(!storeName) reject('Нет хранилища');
        //let checkArr = checkColl(arr);
        //if(!checkArr.state) reject(checkArr.err);

        let request = indexedDB.open(dbName);
        request.onerror = (event) => reject('Ошибка открытия базы '+ event.target.errorCode);
        request.onsuccess = () => {
            let db = request.result;
            let tx = db.transaction(storeName, "readwrite");
            let store = tx.objectStore(storeName);

            arr.forEach((el)=>{
              el.id = ''+ Date.now();  
              store.put(el);
              console.log('saveToDb5');
            });  

            tx.oncomplete = () => {
                db.close();
                console.log('saveToDb6');
                resolve('Все запросы выполнены успешно');
            }; 
            tx.onabort = () => reject('Ошибка транзакции '+ tx.error.message);
        };
 
    });


}


})();