// import 'babel-polyfill'; // 为了使用es6的新api 如promise等
// import './css/bootstrap.css'
import 'css/index';
import 'css/black';
import 'css/nav';
import 'css/stylus';
import {test} from 'js/modules1';
import 'js/test.js';
let delay = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, 2000);
    });
};
delay().then(() => {
    console.log('延迟输出');
});
test();
console.log($);
// 这里通过 /* eslint-disable-line */ 使这一行不报eslint的错，因为这里的vue是通过webpack自动引入的
// console.log(Vue); /* eslint-disable-line */
