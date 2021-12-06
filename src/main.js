'use strict';
// 48 - 57 숫자
// 33 - 47 특수
// 58 - 64 특수
// 65 - 122 영문
// 123 - 126 특수
// 12593 - 55203 한글

const calendar = {
    render: function(base, year, month, date, userData){
        let days = ['일','월','화','수','목','금','토'];

        let lastDate = new Date(year, month+1, 0).getDate();
        let startDay = new Date(year, month, 1).getDay();

        let allDate = [];

        for(let i=0; i<startDay; i++) allDate.push('');
        for(let i=0; i<lastDate; i++) allDate.push(i+1);

        

        return `<table class="table us-none" type="cal">
            <thead>
                <tr>
                    ${days.map(x=>`<th>${x}</th>`).join('')}
                </tr>
            </thead>
            <tbody class="text-center">
                <tr>
                    ${allDate.map((x,i)=>{
                        let tasks = null;
                        if(userData && userData.task[year] && userData.task[year][month] && userData.task[year][month][x]){
                            tasks = userData.task[year][month][x];
                        }
                        if(tasks) tasks = tasks.filter(todo=>!todo.done);
                        if(i%7==0){
                            return `</tr><tr><td ${x==date?`class="text-subpoint position-relative"`:`${x!==''?'':`class="${x==''?'pe-none':''}"`}`}>${x} ${x!=''?`<sup>${tasks?tasks.length>0?tasks.length:'':''}</sup>`:''}</td>`
                        } else return `<td ${base.getFullYear()==year && base.getMonth()==month && x==date?`class="text-subpoint position-relative"`:`${x!==''?'':`class="${x==''?'pe-none':''}"`}`}>${x} ${x!=''?`<sup>${tasks?tasks.length>0?tasks.length:'':''}</sup>`:''}</td>`;
                    }).join('')}
            </tbody>
        </table>`;
    }
}

const detail = {
    render: function(year, month, date, task){
        return `
            <div>
                <div>
                    <span class="h6">Task List</span>
                </div>
                <table class="table fs-7">
                    <thead class="text-center">
                        <tr class="pe-none">
                            <td>1</td>
                            <td>2</td>
                            <td>3</td>
                            <td>4</td>
                            <td>5</td>
                            <td>6</td>
                            <td>7</td>
                            <td>8</td>
                            <td>9</td>
                            <td>10</td>
                            <td>11</td>
                            <td>12</td>
                            <td>13</td>
                            <td>14</td>
                            <td>15</td>
                            <td>16</td>
                            <td>17</td>
                            <td>18</td>
                            <td>19</td>
                            <td>20</td>
                            <td>21</td>
                            <td>22</td>
                            <td>23</td>
                            <td>24</td>
                        </tr>
                    </thead>
                    ${task==null||task.length==0?'<tr><td colspan="24" class="pe-none">등록된 일정이 없습니다.</td></tr>':task.map(t=>`<tr>${t.start-1!==0?`<td class="pe-none" colspan="${t.start-1}"></td>`:''}<td type="scd" colspan="${t.end}" ${t.done==true?`class="done"`:''}><span idx="${t.id}">${t.text}</span> <span class="text-danger" id="taskDel">&times</span></td>${24-parseInt(t.start)-parseInt(t.end)+1>0?`<td class="pe-none" colspan="${24-parseInt(t.start)-parseInt(t.end)+1}"></td>`:''}</tr>`).join('')}
                </table>
            </div>
            <hr>
            <div>
                <textarea id="todo" class="form-input my-2 fs-6" placeholder="일정을 입력하고 시간을 설정해주세요."></textarea>
                시작시간 <input class="form-input" type="number" min="1" max="24" id="start" value="1">
                소요시간 <input class="form-input" type="number" min="1" max="24" id="end" value="1">
                <button class="btn btn-info" id="create">추가</button>
            </div>
        `;
    }
}

const ArchiScheduler = (function(){
    function Controller(){
        let models = null;
        let modal;

        this.init = function(model){
            models = model;

            inputYear.addEventListener('change', this.applyCalendar);
            inputMonth.addEventListener('change', this.applyCalendar);
            prev.addEventListener('click', this.prevHandler);
            next.addEventListener('click', this.nextHandler);
            now.addEventListener('click', this.nowHandler);
            window.addEventListener('click', this.loginHandler);
            window.addEventListener('click', this.deleteModal);
            window.addEventListener('click', this.newMember);
            window.addEventListener('click', this.signMember);
            window.addEventListener('click', this.logoutMember);
            window.addEventListener('click', this.createTask);
            window.addEventListener('click', this.taskDel);
            window.addEventListener('click', this.doneHandler);

            window.addEventListener('click', this.renderDetail);
        }

        this.doneHandler = function(ev){
            let target = ev.target;
            if(target.getAttribute('type')!=='scd') return;

            models.doneHandler(target, current);
        }

        this.taskDel = function(ev){
            let target = ev.target;
            if(target.id!='taskDel')return ;
            let answer = confirm(`"${target.previousElementSibling.textContent}" 내용을 지우시겠습니까?`);
            if(answer) models.taskDel(target);
        }

        this.createTask = function(ev){
            let target = ev.target;
            if(target.id!='create')return ;
            let starts = start.value;
            let ends = end.value;
            let todo = document.getElementById('todo');
            if(todo.value.length==0){
                alert('내용을 입력해주세요!');
                return;
            } else if(starts.length==0 || ends.length == 0){
                alert('시간을 입력해주세요!');
                return;
            }
            models.createTask(todo, starts, ends);
        }

        this.newMember = function(ev){
            let target = ev.target;
            if(target.id !== 'newMember') return;
            let ids = id.value;
            let pws = pw.value;
            if(ids.length>10 || pws.length>10){
                alert('아이디나 비밀번호가 너무 깁니다!');
            } else {
                if(ids.match(/[^a-zA-Zㄱ-힣0-9]/gm)){
                    alert('특수문자가 포함되면 안됩니다!');
                }
                else if(pws.match(/[^a-zA-Zㄱ-힣0-9]/gm)){
                    alert('특수문자가 포함되면 안됩니다!');
                } else {
                    models.newMember(ids, pws);
                    modal.remove();
                }
            }
        }
        
        this.signMember = function(ev){
            let target = ev.target;
            if(target.id !== 'sign') return;
            let ids = id.value;
            let pws = pw.value;
            models.signMember(ids, pws);
            modal.remove();
        }

        this.logoutMember = function(ev){
            let target = ev.target;
            if(target.id !== 'logout') return;
            models.logoutMember(target);
        }

        this.deleteModal = function(ev){
            let target = ev.target;
            if(target.id !== 'delBtn') return;
            modal.remove();
        }

        this.loginHandler = function(ev){
            let target = ev.target;
            if(target.id !== 'login')return ;
            modal = document.createElement('div');
            modal.style.width = '35%';
            modal.classList.add('bg-light','rounded-5', 'position-absolute','top-50','start-50','position-middle', 'p-5');
            modal.style.boxShadow = '0 0 1rem 0 rgba(var(--pl-dark-rgb), 0.3)'
            modal.innerHTML = `
                <div class="w-flex justify-content-between">
                    <span class="h6">Welcome!</span> <span><button class="btn btn-danger btn-sm" id="delBtn">&times;</button></span>
                </div>
                <div class="w-flex justify-content-between my-1"><span>ID</span><input class="form-input col-15" type="text" id="id"></div>
                <div class="w-flex justify-content-between my-1"><span>PW</span><input class="form-input col-15" type="password" id="pw"></div>
                <div class="text-end">
                    <button class="btn btn-info mx-1" id="newMember">생성</button>
                    <button class="btn btn-info" id="sign">로그인</button>
                </div>
            `;
            document.body.append(modal);
        }

        this.renderDetail = function(ev){
            let target = ev.target;
            if(target.tagName !== 'TD' || target.getAttribute('type')=='scd') return;

            models.renderDetail(target);
        }
        
        this.nowHandler = function(ev){
            models.nowHandler(ev);
        }

        this.prevHandler = function(ev){
            models.prevHandler(ev);
        }

        this.nextHandler = function(ev){
            models.nextHandler(ev);
        }
        
        this.applyCalendar = function(ev){
            models.applyCalendar(ev);
        }
    }

    function Model(){
        let views = null;
        let userData = null;
        let signed = null;
        let count = 1;
        let currentDate = 0;

        let base = new Date();
        let year = base.getFullYear();
        let month = base.getMonth();
        let date = base.getDate();

        this.init = function(view){
            views = view;

            for(let i=2000; i<2099; i++){
                inputYear.innerHTML += `<option value="${i}">${i}</option>`;
            }
            for(let i=0; i<12; i++){
                inputMonth.innerHTML += `<option value="${i}">${i+1}</option>`;
            }

            setTimeout(()=>inputYear.value = year);
            setTimeout(()=>inputMonth.value = month);

            this.connectApp();
            this.applyCalendar();

            for(let user of userData){
                if(user.sign){
                    signed = user;
                    if(signed) {
                        document.getElementById('login').hidden = true;
                        document.getElementById('login').insertAdjacentHTML('beforebegin', `
                            <div id="outBundle"><span>${user.id} 접속 중 </span><button id="logout" class="btn btn-danger">logout</button></div>
                        `);
                        break;
                    }
                }
            }
        }

        this.doneHandler = function(target, current){
            // target.classList.toggle('done');
            let task = target.querySelector('[idx]');
            let idx = task.getAttribute('idx');
            let txt = task.textContent;
            for(let key of userData){
                if(key.id == signed.id){
                    for(let todo of key.task[year][month][current.textContent.split('-').pop()]){
                        if(todo.id == idx && todo.text == txt){
                            todo.done = !todo.done;
                            break;
                        }
                    }
                    break;
                }
            }
            this.applyCalendar();
            this.setStorage();
            this.getStorage();
            views.renderDetail(year, month, currentDate, signed.task[year][month][currentDate]);
        }

        this.nowHandler = function(ev){
            year = base.getFullYear();
            month = base.getMonth();
            inputYear.value = year;
            inputMonth.value = month;
            this.applyCalendar();
            views.renderDetail(year, month, date, signed.task[year][month][date]);
        }

        this.prevHandler = function(ev){
            if(month==0) {
                year--;
                month = 11;
            }
            else month--;
            inputYear.value = year;
            inputMonth.value = month;
            this.applyCalendar();
        }

        this.nextHandler = function(ev){
            if(month==11) {
                year++;
                month = 0;
            } else month++;
            inputYear.value = year;
            inputMonth.value = month;
            this.applyCalendar();
        }

        this.applyCalendar = function(ev){
            if(ev) {
                year = inputYear.value;
                month = inputMonth.value;
            }
            views.applyCalendar(base, year, month, date, signed);
        }

        this.renderDetail = function(td){
            let clickDate = parseInt(td.textContent);
            let isEmpty = false;
            let taskList = null;
            currentDate = clickDate;
            for(let user of userData){
                if(signed && user.id == signed.id){
                    for(let key in user.task){
                        if(key == year){
                            for(let key2 in user.task[key]){
                                if(key2 == month){
                                    for(let key3 in user.task[key][key2]){
                                        if(key3 == clickDate){
                                            taskList = user.task[key][key2][key3];
                                            isEmpty = false;
                                            break;
                                        } else {
                                            isEmpty = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    alert('로그인하셔야합니다.');
                    break;
                }
            }
            if(signed) views.renderDetail(year, month, clickDate, taskList);
            else views.clearDetail();
        }

        this.connectApp = function(){
            this.getStorage();
        }

        this.getStorage = function(){
            if(!localStorage['userData']) localStorage['userData'] = JSON.stringify([]);
            userData = JSON.parse(localStorage['userData']);
            for(let user of userData){
                if(user.sign){
                    signed = user;
                    break;
                }
            }
        }

        this.setStorage = function(data){
            localStorage['userData'] = JSON.stringify(userData);
        }

        this.taskDel = function(target){
            let str = target.previousElementSibling;
            for(let user of userData){
                if(user.id == signed.id){
                    user.task[year][month][currentDate] = user.task[year][month][currentDate].filter(todo=>todo.text !== str.textContent || todo.id !== parseInt(str.getAttribute('idx')));
                }
            }

            this.applyCalendar();
            this.setStorage();
            this.getStorage();
            views.renderDetail(year, month, currentDate, signed.task[year][month][currentDate]);
        }

        this.createTask = function(task, start, end){
            let val = task.value;
            for(let user of userData){
                if(user.id == signed.id){
                    if(!user.task[year]) user.task[year] = {};
                    if(!user.task[year][month]) user.task[year][month] = {};
                    if(!user.task[year][month][currentDate]) user.task[year][month][currentDate] = [];
                    let len = user.task[year][month][currentDate].length-1;

                    if(len>=0) count = user.task[year][month][currentDate][len]['id']+1;
                    
                    user.task[year][month][currentDate].push({
                        id: count,
                        text: val,
                        start: start,
                        end: end,
                        done: false,
                    });
                    break;
                }
            }

            this.applyCalendar();
            this.setStorage();
            this.getStorage();
            views.renderDetail(year, month, currentDate, signed.task[year][month][currentDate]);
        }

        this.newMember = function(id, pw){
            let dup = false;
            for(let user of userData){
                if(user.id == id) {
                    dup = true;
                }
            }
            if(Object.keys(userData).length==0){
                dup = false;
            }
            if(dup){
                alert('이미 있는 아이디입니다.');
            } else {
                userData.push({
                    id: id,
                    password: [...this.Encrypto(pw)],
                    sign: false,
                    task: {},
                });
                this.setStorage();
            }
        }

        this.signMember = function(id, pw){
            let matchId = false;
            let matchPw = false;
            for(let user of userData){
                if(user.id == id) {
                    matchId = true;
                }
                if(this.decode(user.password) == pw){
                    matchPw = true;
                }
            }
            if(matchId && matchPw){
                for(let user of userData){
                    user.sign = true;
                    signed = user;
                    if(signed) {
                        document.getElementById('login').hidden = true;
                        document.getElementById('login').insertAdjacentHTML('beforebegin', `
                            <div id="outBundle"><span>${user.id} 접속 중 </span><button id="logout" class="btn btn-danger">logout</button></div>
                        `);
                        this.applyCalendar();
                        break;
                    }
                }
                this.setStorage();
            } else {
                alert('아이디나 비밀번호가 틀립니다.');
            }
        }

        this.logoutMember = function(target){
            for(let user of userData){
                if(user.sign){
                    if(user.id == signed.id){
                        signed = null;
                        user.sign = false;
                    }
                }
            }
            this.setStorage();
            document.getElementById('login').removeAttribute('hidden');
            target.parentNode.remove();
        }

        this.Encrypto = function(str){
            let encoding = new TextEncoder();
            let sp = str.split('');
            
            sp.splice(Math.random()*str.length, 0, String.fromCharCode((Math.random()*14)+33)).join('');
            sp.splice(Math.random()*str.length, 0, String.fromCharCode((Math.random()*6)+58)).join('');
            sp.splice(Math.random()*str.length, 0, String.fromCharCode((Math.random()*3)+123)).join('');
            str = sp;
            
            let encoded = encoding.encode(str.join(''));
            return new Uint32Array(encoded).reverse();
        }

        this.decode = function(encrypto){
            let decoding = new TextDecoder();
            let decoded = decoding.decode(new Uint32Array(encrypto).reverse());
            
            return decoded.split('').filter(x=>x!='\x00').join('').replace(/[^a-zA-Zㄱ-힣0-9]/gm,'');
        }
    }

    function View(){
        let parts = null;
        let calendarView = null;

        this.init = function(components){
            parts = components;

            calendarView = document.getElementById('calendarView');
        }

        this.renderDetail = function (year, month, td, list){
            this.clearDetail();
            document.getElementById('timeLine').insertAdjacentHTML('afterbegin', `<div id="current" class="fs-3 fw-bold">${year}-${month+1}-${td}</div>`);
            document.getElementById('detail').insertAdjacentHTML('beforeend', parts.detail.render(year, month, td, list));
        }

        this.applyCalendar = function(base, year, month, date, userData){
            calendarView.innerHTML = '';
            calendarView.innerHTML += parts.calendar.render(base, year, month, date, userData);
        }

        this.clearDetail = function(){
            if(document.getElementById('current'))document.getElementById('current').remove();
            document.getElementById('detail').innerHTML = '';
        }
    }
    return {
        init: function(){
            const components = {
                calendar,
                detail,
            };

            const view = new View();
            const model = new Model();
            const controller = new Controller();

            view.init(components);
            model.init(view);
            controller.init(model);
        }
    }
})();

let archiScheduler = ArchiScheduler.init();