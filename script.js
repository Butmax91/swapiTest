class App {
    constructor(el){
        this.preloader = document.getElementById('loader');
        this.app = el;
        this.menu =  document.createElement('ul');
        this.content = document.createElement('div');
        this.search = document.createElement('input');
        this.searchList = document.createElement('ul');
        this.infoContainer = document.createElement('div');
        this.prev = document.createElement('button');
        this.next = document.createElement('button');
        this.buttonContainer = document.createElement('div');
            this.asc = true;
        this.data = [];
        this.infoData = {};
        this.currentUrl = this.create();
        this.init();

    }
    init(){
        this.infoContainer.classList.add('info');
        this.infoContainer.innerHTML = `<table ><tbody class="infoContainer"></tbody></table>`;
        this.content.classList.add('content');
        this.menu.classList.add('menu');
        this.search.setAttribute('type','search');
        this.search.placeholder = 'Search by name...';
        this.searchList.classList.add('searchList');
        this.buttonContainer.classList.add('buttonContainer');
        this.prev.classList.add('prev');
        this.prev.innerHTML = 'prev';
        this.next.classList.add('next');
        this.next.innerHTML = 'next';

        this.app.appendChild(this.search);
        this.app.appendChild(this.searchList);
        this.app.appendChild(this.menu);
        this.app.appendChild(this.content);
        this.app.appendChild(this.buttonContainer);
        this.buttonContainer.appendChild(this.prev);
        this.buttonContainer.appendChild(this.next);
        this.app.appendChild(this.infoContainer);

        this.tabTogle();
        this.liveSearch();
        this.showInfo();
        this.prevNextToogle();
    }
    create = async ()=> {
        await fetch('https://swapi.co/api/')
            .then((res)=>{
                return res.json()
            })
            .then((res)=>{
                let url;
                Object.keys(res).forEach((el,i)=>{

                    this.menu.innerHTML += `<li data-url="${res[el]}"
                                                class="menu__item "> ${el}</a></li>`;
                    if (i===0){
                        url = res[el];
                    }
                });
                return url;
            })
            .then((res)=>{
               fetch(res)
                   .then(res=>res.json())
                   .then(res=>{
                       this.createMainContent(res);
                   })
            });
    };
    createMainContent = async (prom)=> {
        this.content.innerHTML = '';
        this.content.innerHTML += `<ul class="names"></ul>`;
        this.data = prom;
        this.prev.disabled = !this.data.previous;
        this.next.disabled = !this.data.next;
        if (!this.data.previous && !this.data.next) {
            this.prev.style.display = 'none';
            this.next.style.display = 'none';
        }else{
            this.prev.style.display = 'block';
            this.next.style.display = 'block';
        }
        this.data.results.sort((a,b)=>{
            if (this.asc){
                if(a.name){
                    return a.name > b.name ? 1 : -1
                }
                if (a.title){
                    return a.title > b.title ? 1 : -1
                }

            }else{
                if(a.name){
                    return a.name < b.name ? 1 : -1
                }
                if (a.title){
                    return a.title < b.title ? 1 : -1
                }
            }

        });
        this.content.querySelector('.names').innerHTML = '';
        this.content.querySelector('.names').innerHTML +=`<li class="sort">name <span class="sortDirrection"></span></li>`;
        this.app.querySelector('.sortDirrection').style.transform = this.asc? 'rotate(45deg)':'rotate(-135deg)';
        this.data.results.forEach((el,i)=>{
            this.infoData = el;
            this.content.querySelector('.names').innerHTML +=`<li class="names__item">${el['name'] || el['title']}</li>`
        });
        this.preloader.style.display = 'none';
    };
    prevNextToogle =  ()=>{
        this.prev.addEventListener('click',()=>{
            this.preloader.style.display = 'block';
            fetch(this.data.previous)
                .then(r=>r.json())
                .then(r=>{
                    this.createMainContent(r)
                })
        });
        this.next.addEventListener('click',()=>{
            this.preloader.style.display = 'block';
            fetch(this.data.next)
                .then(r=>r.json())
                .then(r=>{
                    this.createMainContent(r)
                })
        });
    };
    tabTogle(){
        this.menu.addEventListener('click',(e)=>{
            if(e.target.tagName==='LI' ){
                this.preloader.style.display = 'block';
                let url = e.target.dataset.url;
                fetch(url)
                    .then(res=>res.json())
                    .then(res=>{
                        this.createMainContent(res);
                })
            }
        })
    }
    liveSearch(){
        this.search.addEventListener('input',(e)=>{
            let text = e.target.value;
            if (text){
                this.searchList.style.display = 'block';
            }else{
                this.searchList.style.display = 'none';
            }
            fetch('https://swapi.co/api/people/?search='+text)
                .then(r=>r.json())
                .then(r=>{
                    if (r.results){
                        this.searchList.innerHTML = ''
                        ;[...r.results].forEach((el,i)=>{
                            if(i<5){
                                this.searchList.innerHTML +=`<li class="names__item">${el.name}</li>`
                            }
                        })
                    }
                })
        })
    }
    showInfo(){
        this.app.addEventListener('click',(e)=>{
            if (e.target.classList.contains('sort')){
                this.asc = !this.asc;
                this.createMainContent(this.data);
            }
            if(e.target.classList.contains('names__item')){
                this.preloader.style.display = 'block';
                let inData = false;
                this.data.results.forEach((el)=>{
                    Object.values(el).forEach((ObjVal)=>{
                        if(ObjVal === e.target.innerHTML){
                            inData = true
                        }
                    })
                });
                if (e.target.innerHTML.indexOf('https') === -1 && inData) {
                    this.data.results.forEach((el)=>{
                        Object.values(el).forEach((ObjVal)=>{
                            if(ObjVal === e.target.innerHTML){
                                inData = false;
                                this.infoContainer.querySelector('.infoContainer').innerHTML ='';
                                for (let elKey in el) {
                                    if(typeof el[elKey] === 'object'  ){
                                        this.infoContainer.querySelector('.infoContainer').innerHTML +=
                                            `<tr>
                                        <td>${elKey}</td>
                                        <td>${ el[elKey].map((elem)=>{
                                                return `<span class="names__item">${elem}</span>`
                                            })}</td>
                                    </tr>`
                                    }else if(typeof el[elKey] !== 'number' &&  el[elKey].indexOf('https')!==-1){
                                        this.infoContainer.querySelector('.infoContainer').innerHTML +=
                                            `<tr>
                                                <td>${elKey}</td>
                                                <td><span class="names__item">${el[elKey]}</span></td>
                                            </tr>`
                                    }else{
                                        this.infoContainer.querySelector('.infoContainer').innerHTML +=
                                            `<tr>
                                                <td>${elKey}</td>
                                                <td>${el[elKey]}</td>
                                            </tr>`
                                    }
                                }
                                this.preloader.style.display = 'none';
                            }
                        })
                    })
                }else if(e.target.innerHTML.indexOf('https') !== -1){
                    fetch(e.target.innerHTML)
                        .then(r=>r.json())
                        .then(r=>{
                            let el = r;
                            this.infoContainer.querySelector('.infoContainer').innerHTML ='';
                            for (let elKey in el) {

                                if(typeof el[elKey] === 'object' ){
                                    this.infoContainer.querySelector('.infoContainer').innerHTML +=
                                        `<tr>
                                        <td>${elKey}</td>
                                        <td>${ el[elKey].map((elem)=>{
                                            return `<span class="names__item">${elem}</span>`
                                        })}</td>
                                    </tr>`
                                }else if(typeof el[elKey] !== 'number' && el[elKey].indexOf('https')!==-1){
                                    this.infoContainer.querySelector('.infoContainer').innerHTML +=
                                        `<tr>
                                                <td>${elKey}</td>
                                                <td><span class="names__item">${el[elKey]}</span></td>
                                            </tr>`
                                }else{
                                    this.infoContainer.querySelector('.infoContainer').innerHTML +=
                                        `<tr>
                                                <td>${elKey}</td>
                                                <td>${el[elKey]}</td>
                                            </tr>`
                                }
                            }
                            this.preloader.style.display = 'none';
                        })
                }else{
                    fetch('https://swapi.co/api/people/?search='+e.target.innerHTML)
                        .then(r=>r.json())
                        .then(r=>{
                            let el = r.results[0];
                            this.infoContainer.querySelector('.infoContainer').innerHTML ='';
                            for (let elKey in el) {
                                if(typeof el[elKey] === 'object' ){
                                    this.infoContainer.querySelector('.infoContainer').innerHTML +=
                                        `<tr>
                                        <td>${elKey}</td>
                                        <td>${ el[elKey].map((elem)=>{
                                            return `<span class="names__item">${elem}</span>`
                                        })}</td>
                                    </tr>`
                                }else if(typeof el[elKey] !== 'number' && el[elKey].indexOf('https')!==-1){
                                    this.infoContainer.querySelector('.infoContainer').innerHTML +=
                                        `<tr>
                                                <td>${elKey}</td>
                                                <td><span class="names__item">${el[elKey]}</span></td>
                                            </tr>`
                                }else{
                                    this.infoContainer.querySelector('.infoContainer').innerHTML +=
                                        `<tr>
                                                <td>${elKey}</td>
                                                <td>${el[elKey]}</td>
                                            </tr>`
                                }
                            }
                            this.preloader.style.display = 'none';
                    })
                }
            }
            this.search.value = '';
            this.searchList.style.display = 'none'

        })
    }
}

window.addEventListener('DOMContentLoaded',()=>{

    if (document.querySelector('.app')){
        new App(document.querySelector('.app'))
    }
});

